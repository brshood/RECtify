const axios = require('axios');

class MongoAtlasIPManager {
  constructor() {
    this.projectId = process.env.MONGODB_ATLAS_PROJECT_ID;
    this.publicKey = process.env.MONGODB_ATLAS_PUBLIC_KEY;
    this.privateKey = process.env.MONGODB_ATLAS_PRIVATE_KEY;
    this.baseURL = 'https://cloud.mongodb.com/api/atlas/v1.0';
    this.lastKnownIP = null;
    
    // Validate required environment variables
    if (!this.projectId || !this.publicKey || !this.privateKey) {
      console.log('⚠️ MongoDB Atlas API credentials not found. IP management disabled.');
      console.log('Required: MONGODB_ATLAS_PROJECT_ID, MONGODB_ATLAS_PUBLIC_KEY, MONGODB_ATLAS_PRIVATE_KEY');
    }
  }

  isConfigured() {
    return !!(this.projectId && this.publicKey && this.privateKey);
  }

  async getCurrentIP() {
    try {
      const response = await axios.get('https://api.ipify.org?format=json', { timeout: 10000 });
      return response.data.ip;
    } catch (error) {
      console.error('Failed to get current IP:', error.message);
      return null;
    }
  }

  async getAccessList() {
    if (!this.isConfigured()) return [];
    
    try {
      const response = await axios.get(
        `${this.baseURL}/groups/${this.projectId}/accessList`,
        {
          auth: {
            username: this.publicKey,
            password: this.privateKey
          },
          timeout: 15000
        }
      );
      return response.data.results || [];
    } catch (error) {
      console.error('Failed to get access list:', error.response?.data?.detail || error.message);
      return [];
    }
  }

  async addIPToWhitelist(ip, comment = 'Railway Dynamic IP') {
    if (!this.isConfigured()) return null;
    
    try {
      const response = await axios.post(
        `${this.baseURL}/groups/${this.projectId}/accessList`,
        [{
          ipAddress: ip,
          comment: `${comment} - ${new Date().toISOString()}`
        }],
        {
          auth: {
            username: this.publicKey,
            password: this.privateKey
          },
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to add IP to whitelist:', error.response?.data?.detail || error.message);
      return null;
    }
  }

  async removeIPFromWhitelist(ip) {
    if (!this.isConfigured()) return false;
    
    try {
      await axios.delete(
        `${this.baseURL}/groups/${this.projectId}/accessList/${encodeURIComponent(ip)}`,
        {
          auth: {
            username: this.publicKey,
            password: this.privateKey
          },
          timeout: 15000
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to remove IP from whitelist:', error.response?.data?.detail || error.message);
      return false;
    }
  }

  async updateRailwayIP() {
    if (!this.isConfigured()) {
      console.log('⚠️ MongoDB Atlas IP management disabled - missing API credentials');
      return false;
    }

    try {
      const currentIP = await this.getCurrentIP();
      if (!currentIP) {
        console.log('❌ Could not determine current IP');
        return false;
      }

      console.log(`🌐 Current Railway IP: ${currentIP}`);

      // If IP hasn't changed, skip update
      if (this.lastKnownIP === currentIP) {
        console.log('✅ IP unchanged, no whitelist update needed');
        return true;
      }

      // Get current access list
      const accessList = await this.getAccessList();
      
      // Find existing Railway entries (look for our comment pattern)
      const railwayEntries = accessList.filter(entry => 
        entry.comment && (
          entry.comment.includes('Railway Dynamic IP') ||
          entry.comment.includes('Railway')
        )
      );

      // Check if current IP is already whitelisted
      const existingEntry = accessList.find(entry => entry.ipAddress === currentIP);
      if (existingEntry) {
        console.log(`✅ Current IP ${currentIP} is already whitelisted`);
        this.lastKnownIP = currentIP;
        return true;
      }

      // Add current IP to whitelist
      console.log(`🔄 Adding IP ${currentIP} to MongoDB Atlas whitelist...`);
      const addResult = await this.addIPToWhitelist(currentIP, 'Railway Dynamic IP');
      
      if (addResult) {
        console.log(`✅ Successfully added IP ${currentIP} to MongoDB Atlas whitelist`);
        this.lastKnownIP = currentIP;
        
        // Clean up old Railway IPs (keep only the current one)
        if (railwayEntries.length > 0) {
          console.log(`🗑️ Cleaning up ${railwayEntries.length} old Railway IP(s)...`);
          for (const oldEntry of railwayEntries) {
            if (oldEntry.ipAddress !== currentIP) {
              console.log(`   Removing: ${oldEntry.ipAddress}`);
              await this.removeIPFromWhitelist(oldEntry.ipAddress);
              // Small delay to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        return true;
      } else {
        console.log(`❌ Failed to add IP ${currentIP} to whitelist`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating Railway IP:', error.message);
      return false;
    }
  }

  // Method to check and update IP periodically
  async checkAndUpdateIP() {
    try {
      const currentIP = await this.getCurrentIP();
      if (currentIP && currentIP !== this.lastKnownIP) {
        console.log(`🔄 IP changed from ${this.lastKnownIP} to ${currentIP}, updating whitelist...`);
        return await this.updateRailwayIP();
      }
      return true;
    } catch (error) {
      console.error('❌ Error during periodic IP check:', error.message);
      return false;
    }
  }
}

module.exports = MongoAtlasIPManager;
