// Mock Retell SDK for development
export class Retell {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  calls = {
    create: async (params: {
      phoneNumber: string
      agentId: string
      webhookUrl?: string
      metadata?: Record<string, unknown>
    }) => {
      // Mock call creation
      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      console.log('Mock Retell call created:', {
        id: callId,
        ...params
      })

      // Simulate async call initiation
      setTimeout(() => {
        console.log(`Mock call ${callId} started`)
      }, 1000)

      return {
        id: callId,
        status: 'initiated',
        phoneNumber: params.phoneNumber,
        agentId: params.agentId
      }
    },

    get: async (callId: string) => {
      return {
        id: callId,
        status: 'completed',
        duration: 120,
        transcript: 'Mock call transcript',
        recordingUrl: `https://mock-recordings.com/${callId}.mp3`
      }
    },

    list: async (params?: Record<string, unknown>) => {
      return {
        data: [],
        hasMore: false
      }
    }
  }

  agents = {
    create: async (params: Record<string, unknown>) => {
      const agentId = `agent_${Date.now()}`
      return {
        id: agentId,
        ...params
      }
    },

    get: async (agentId: string) => {
      return {
        id: agentId,
        name: 'Sales Agent',
        voice: 'en-US-JennyNeural'
      }
    },

    list: async () => {
      return {
        data: [
          {
            id: 'sales-agent-bm',
            name: 'Sales Agent (Bahasa Malaysia)',
            voice: 'ms-MY-YasminNeural'
          }
        ]
      }
    }
  }
}

export default Retell
