import { Router, Request, Response } from 'express';
import { PSNApi } from '../PSNApi';
import { MessagingConfig, ResourceType } from '../types/Group';
import { getNPSSO } from '../utils/npsso';

const router = Router();

// Initialize PSN API instance (should be injected via dependency injection in production)
let psnApi: PSNApi | null = null;

// Middleware to initialize PSN API
const initializePSNApi = async (req: Request, res: Response, next: () => void) => {
  let npsso = process.env.NPSSO || req.headers['x-npsso'] as string;
  const clientId = process.env.CLIENT_ID || req.headers['x-client-id'] as string;
  const clientSecret = process.env.CLIENT_SECRET || req.headers['x-client-secret'] as string || '';

  // If NPSSO is not provided, try to fetch it automatically
  if (!npsso) {
    console.log('NPSSO not found, attempting to fetch from Sony API...');
    const [success, fetchedNPSSO] = await getNPSSO();
    if (success) {
      npsso = fetchedNPSSO;
      console.log('NPSSO fetched successfully');
    } else {
      res.status(400).json({
        error: 'NPSSO is required and could not be fetched automatically. Please provide NPSSO via environment variable, header, or ensure you can access https://ca.account.sony.com/api/v1/ssocookie'
      });
      return;
    }
  }

  if (!clientId) {
    res.status(400).json({ error: 'ClientId is required' });
    return;
  }

  // Create new instance if not exists or if credentials changed
  if (!psnApi) {
    psnApi = new PSNApi(npsso, clientId, clientSecret);
  } else if (psnApi.getNPSSO() !== npsso) {
    // Update NPSSO if it changed
    psnApi.setNPSSO(npsso);
  }
  next();
};

// GET /api/psn/npsso - Get NPSSO token from Sony
router.get('/npsso', async (req: Request, res: Response) => {
  try {
    const [success, npsso] = await getNPSSO();
    if (success) {
      res.json({ success: true, npsso });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get NPSSO token' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/psn/token - Get access token
router.get('/token', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const [success, tokens] = await psnApi.GetAccessToken();
    if (success) {
      res.json({ success: true, tokens });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get access token' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/psn/profile/:name? - Get profile (optional name parameter)
router.get('/profile/:name?', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const name = req.params.name || '';
    const [success, profile] = await psnApi.GetProfile(name);
    if (success) {
      res.json({ success: true, profile });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get profile' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/psn/friends - Get friends list
router.get('/friends', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const [success, friends] = await psnApi.GetFriends();
    if (success) {
      res.json({ success: true, friends });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get friends' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/psn/friends/:name - Delete friend
router.delete('/friends/:name', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const name = req.params.name;
    const success = await psnApi.DeleteFriend(name);
    if (success) {
      res.json({ success: true, message: `Friend ${name} deleted successfully` });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete friend' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/psn/search - Universal search
router.post('/search', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const { name, domain } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Search name is required' });
    }
    const searchDomain = domain || 'SocialAllAccounts';
    const [success, result] = await psnApi.UniversalSearch(name, searchDomain);
    if (success) {
      res.json({ success: true, result });
    } else {
      res.status(500).json({ success: false, error: 'Failed to perform search' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/psn/groups - Create group
router.post('/groups', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const { invites } = req.body;
    if (!invites || !Array.isArray(invites) || invites.length === 0) {
      return res.status(400).json({ error: 'Invites array is required' });
    }
    const [success, group] = await psnApi.CreateGroup(invites);
    if (success) {
      res.json({ success: true, group });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create group' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/psn/groups - Get groups
router.get('/groups', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const [success, groups] = await psnApi.GetGroups();
    if (success) {
      res.json({ success: true, groups });
    } else {
      res.status(500).json({ success: false, error: 'Failed to get groups' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/psn/messages - Send message
router.post('/messages', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const { groupId, threadId, message } = req.body;
    if (!groupId || !message) {
      return res.status(400).json({ error: 'groupId and message are required' });
    }
    const config: MessagingConfig = { groupId, threadId: threadId || groupId };
    const success = await psnApi.SendMessage(config, message);
    if (success) {
      res.json({ success: true, message: 'Message sent successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/psn/resources - Add resource to group
router.post('/resources', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const { groupId, path: filePath } = req.body;
    if (!groupId || !filePath) {
      return res.status(400).json({ error: 'groupId and path are required' });
    }
    const config: MessagingConfig = { groupId, threadId: '' };
    const [success, resourceId] = await psnApi.AddResourceToGroup(config, filePath);
    if (success) {
      res.json({ success: true, resourceId });
    } else {
      res.status(500).json({ success: false, error: 'Failed to add resource' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/psn/resources/send - Send resource (image/sticker)
router.post('/resources/send', initializePSNApi, async (req: Request, res: Response) => {
  try {
    if (!psnApi) {
      return res.status(500).json({ error: 'PSN API not initialized' });
    }
    const { groupId, threadId, resourceId, type } = req.body;
    if (!groupId || !resourceId || type === undefined) {
      return res.status(400).json({ error: 'groupId, resourceId, and type are required' });
    }
    const config: MessagingConfig = { groupId, threadId: threadId || groupId };
    const resourceType = type as ResourceType;
    const success = await psnApi.SendResourceImpl(config, resourceId, resourceType);
    if (success) {
      res.json({ success: true, message: 'Resource sent successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send resource' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

