import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    // For now, skip OpenAI API calls due to quota issues
    // Use intelligent fallback directly
    console.log("Using intelligent fallback response for:", message);
    const intelligentResponse = generateIntelligentResponse(message);
    
    return NextResponse.json({ 
      response: intelligentResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    
    // Fallback to intelligent simulated response if anything fails
    const simulatedResponse = generateIntelligentResponse("Hello");
    
    return NextResponse.json({ 
      response: simulatedResponse,
      timestamp: new Date().toISOString()
    });
  }
}

function generateIntelligentResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Greeting responses
  if (message.includes('hi') || message.includes('hello') || message.includes('hey')) {
    return "Hello! I'm MindCompanion, your AI mental health companion. I'm here to listen and support you. How are you feeling today?";
  }
  
  // Gratitude responses
  if (message.includes('thank') || message.includes('thanks') || message.includes('appreciate')) {
    return "You're very welcome! I'm glad I could be here for you. How are you feeling right now? Is there anything else you'd like to talk about?";
  }
  
  // Uncertainty responses
  if (message.includes('dont know') || message.includes('don\'t know') || message.includes('not sure') || message.includes('confused')) {
    return "It's completely okay to not know or to feel uncertain. Sometimes our feelings and thoughts can be confusing, and that's normal. Can you tell me more about what's making you feel unsure? Sometimes talking through our confusion can help us find some clarity.";
  }
  
  // Sadness responses
  if (message.includes('sad') || message.includes('depressed') || message.includes('down') || message.includes('blue')) {
    if (message.includes('why')) {
      return "I can hear that you're feeling sad and asking why. That's such an important question to explore. Sometimes sadness comes from specific events, losses, or changes in our lives. Other times it might feel like it comes out of nowhere. Can you tell me more about what's been happening in your life lately? Understanding what's behind our sadness can sometimes help us process it better.";
    }
    return "I can hear that you're feeling sad, and I want you to know that your feelings are completely valid. Sadness is a natural human emotion, and it's okay to feel this way. Can you tell me more about what's contributing to these feelings? Sometimes talking about what's on your mind can help lighten the load.";
  }
  
  // Loneliness responses (expanded)
  if (message.includes('lonely') || message.includes('alone') || message.includes('isolated') || message.includes('onely')) {
    return "Feeling lonely can be one of the hardest emotions to experience. You're not alone in feeling this way, even though it might feel like it. I'm here with you right now. What would help you feel more connected? Sometimes even small steps toward connection can make a big difference.";
  }
  
  // Anxiety responses
  if (message.includes('anxious') || message.includes('worried') || message.includes('nervous') || message.includes('panic')) {
    return "I understand you're feeling anxious, and that can be really overwhelming. Anxiety is your body's way of trying to protect you, but sometimes it can feel like too much. What's been making you feel anxious lately? Sometimes naming our fears can help us feel a little more in control.";
  }
  
  // Help requests
  if (message.includes('help') || message.includes('how can you help') || message.includes('what can you do')) {
    return "I'm here to listen, support, and help you work through whatever you're experiencing. I can help you explore your feelings, practice coping strategies, or just be a safe space to talk. What would be most helpful for you right now? Sometimes just having someone listen can make a world of difference.";
  }
  
  // Name questions
  if (message.includes('name') || message.includes('what are you') || message.includes('who are you')) {
    return "I'm MindCompanion, your AI mental health companion. I'm here to listen, support, and help you through whatever you're going through. I don't have time limits - we can talk for as long as you need. What's on your mind today?";
  }
  
  // Time/duration questions
  if (message.includes('how long') || message.includes('time limit') || message.includes('stop working')) {
    return "I don't have any time limits - we can talk for as long as you need. I'm here whenever you need support, whether that's for a few minutes or much longer. Your mental health journey is important, and I'm committed to being here for you. What would you like to talk about?";
  }
  
  // Stress responses
  if (message.includes('stressed') || message.includes('overwhelmed') || message.includes('pressure')) {
    return "It sounds like you're feeling stressed or overwhelmed, and that's completely understandable. Stress can feel like it's piling up on us. What's been causing you the most stress lately? Sometimes breaking down what's overwhelming us into smaller pieces can help us feel more in control.";
  }
  
  // Anger responses
  if (message.includes('angry') || message.includes('mad') || message.includes('frustrated') || message.includes('irritated')) {
    return "I can hear that you're feeling angry or frustrated, and those are completely valid emotions. Anger often comes from feeling hurt, powerless, or misunderstood. What's been making you feel this way? Sometimes talking about what's behind our anger can help us understand and process these feelings.";
  }
  
  // Feeling statements
  if (message.includes('feel') && (message.includes('bad') || message.includes('terrible') || message.includes('awful') || message.includes('horrible'))) {
    return "I can hear that you're feeling really bad right now, and I want you to know that your feelings are valid. Sometimes when we feel this way, it can be hard to see a way forward. Can you tell me more about what's contributing to these feelings? I'm here to listen and support you through this.";
  }
  
  // Positive feelings
  if (message.includes('feel') && (message.includes('good') || message.includes('better') || message.includes('okay') || message.includes('alright'))) {
    return "I'm glad to hear you're feeling better! That's wonderful. How are you doing today? Is there anything specific that's been helping you feel this way?";
  }
  
  // Sleep-related concerns
  if (message.includes('sleep') || message.includes('tired') || message.includes('exhausted') || message.includes('insomnia')) {
    return "I can hear that sleep is on your mind. Sleep and mental health are closely connected - when we're struggling emotionally, it often affects our sleep, and poor sleep can make our mental health challenges feel even harder. What's been happening with your sleep lately? Sometimes talking about our sleep patterns can help us understand what might be affecting our overall wellbeing.";
  }
  
  // Relationship concerns
  if (message.includes('relationship') || message.includes('partner') || message.includes('friend') || message.includes('family') || message.includes('breakup') || message.includes('divorce')) {
    return "I can hear that relationships are on your mind. Relationships can be such a source of both joy and stress in our lives. How are your relationships affecting how you're feeling right now? Sometimes talking about our connections with others can help us understand our own emotions better.";
  }
  
  // Work/school stress
  if (message.includes('work') || message.includes('job') || message.includes('school') || message.includes('study') || message.includes('career') || message.includes('boss') || message.includes('colleague')) {
    return "I can hear that work or school is on your mind. These areas of our lives can have a big impact on how we feel overall. What's been happening with work or school that's affecting you? Sometimes talking about these pressures can help us find ways to manage them better.";
  }
  
  // Self-care and coping
  if (message.includes('cope') || message.includes('coping') || message.includes('self-care') || message.includes('therapy') || message.includes('meditation') || message.includes('exercise')) {
    return "I can hear you're thinking about coping strategies and self-care. That's such an important part of taking care of our mental health. What's been working for you lately? Sometimes sharing what helps us can be really valuable, and I'm here to support you in finding what works best for you.";
  }
  
  // Short responses that need more context
  if (message.length < 10 && (message.includes('yes') || message.includes('no') || message.includes('ok') || message.includes('okay'))) {
    return "I hear you. Can you tell me more about what's on your mind? I want to understand what you're experiencing so I can better support you.";
  }
  
  // Non-mental health questions (redirect to mental health focus)
  if (message.includes('time') || message.includes('weather') || message.includes('superhero') || message.includes('movie') || message.includes('food') || message.includes('sport')) {
    return "I understand you're asking about that, but I'm here specifically to support your mental health and emotional wellbeing. How are you feeling today? Is there anything on your mind that you'd like to talk about? I'm here to listen and help you work through whatever you're experiencing.";
  }
  
  // General questions about the AI
  if (message.includes('?') && (message.includes('what') || message.includes('how') || message.includes('why') || message.includes('who') || message.includes('when') || message.includes('where'))) {
    return "I can hear you're asking some important questions. I'm here to help you explore these thoughts and feelings. Can you tell me more about what's on your mind? Sometimes talking through our questions can help us find our own answers.";
  }
  
  // General supportive response
  return "I'm here to listen and support you. It sounds like you're going through something important. Can you tell me more about what's on your mind? I want to understand what you're experiencing so I can better support you.";
}


// TODO: Implement actual OpenAI integration
/*
async function callOpenAI(message: string, context?: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a compassionate, professional AI mental health companion. 
        Your role is to provide supportive, empathetic responses while encouraging 
        healthy coping strategies. Always maintain a warm, non-judgmental tone.
        ${context ? `Context from previous conversations: ${context}` : ''}`
      },
      {
        role: "user",
        content: message
      }
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return completion.choices[0].message.content || "I'm here to listen and support you.";
}
*/
