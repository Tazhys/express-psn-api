import axios from 'axios';

const SSO_COOKIE_URL = 'https://ca.account.sony.com/api/v1/ssocookie';

export interface NPSSOResponse {
  npsso: string;
}

/**
 * Fetches NPSSO token from Sony's SSO cookie endpoint
 * @returns Promise with NPSSO token or null if failed
 */
export async function getNPSSO(): Promise<[boolean, string]> {
  try {
    const response = await axios.get<NPSSOResponse>(SSO_COOKIE_URL);
    
    if (response.data && response.data.npsso) {
      return [true, response.data.npsso];
    }
    
    return [false, ''];
  } catch (error: any) {
    console.error(`Failed to fetch NPSSO: ${error.message}`);
    return [false, ''];
  }
}

