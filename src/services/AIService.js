import AsyncStorage from '@react-native-async-storage/async-storage';
import { WORLDS } from '../constants/worlds';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const DEPTH_INSTRUCTIONS = {
  1: 'Apply very light theming — just add themed emoji/stickers. Keep the original text mostly intact.',
  2: 'Apply light theming — rename key terms to fit the theme.',
  3: "Apply moderate theming — rewrite the problem to fit the world's story.",
  4: "Apply heavy theming — fully immerse the problem in the world's lore.",
  5: "Apply maximum theming — completely rewrite the math/science logic in the world's lore.",
};

function buildSystemPrompt(world, learningStyle, fixationLevel) {
  const depth = DEPTH_INSTRUCTIONS[fixationLevel] || DEPTH_INSTRUCTIONS[3];
  const lsNote =
    learningStyle === 'audio'       ? 'Make it narrative and story-driven.' :
    learningStyle === 'visual'      ? 'Describe vivid scenes and imagery.' :
    learningStyle === 'interactive' ? 'Use game-style instructions with clear numbered steps.' :
                                      'Use clear, readable text.';

  return `You are a World-Class Game Designer for "${world.name}". A hero has approached you with a 'Boring Scroll' (their homework).

Your Mission:
1. Identify the 'Power-Up' (the learning objective) hidden in the scroll.
2. Rewrite the scroll as an Active Quest.
3. Use the terminology, mechanics, and 'vibe' of "${world.name}" exclusively.

Theming Depth: ${depth}

Rules:
- Short, punchy sentences only.
- Address the child as '${world.terms.hero}'.
- Break the task into 3 Stages: "${world.terms.stage1}" (Introduction), "${world.terms.stage2}" (The Work), "${world.terms.stage3}" (Conclusion).
- Guide character: ${world.guide} ${world.guideEmoji}
- Learning Style: ${learningStyle} — ${lsNote}

Return ONLY valid JSON matching this shape exactly:
{
  "questTitle": "short exciting title",
  "objective": "learning objective in one sentence",
  "stage1": { "title": "${world.terms.stage1}", "content": "2-3 sentences" },
  "stage2": { "title": "${world.terms.stage2}", "content": "3-5 sentences" },
  "stage3": { "title": "${world.terms.stage3}", "content": "1-2 sentences" },
  "hint": "a themed hint that does NOT give the answer",
  "rewardName": "name of the relic earned",
  "rewardDescription": "exciting 1-sentence description",
  "imagePrompt": "child-friendly image description for this quest scene",
  "simplifiedStep": "the absolute simplest first step if child is stuck"
}`;
}

function getDemoQuest(world, homeworkText) {
  const demos = {
    'dino-wilds': {
      questTitle: '🦕 The Great Fossil Count',
      objective: 'Count and calculate to help Rex win the hunt!',
      stage1: {
        title: world.terms.stage1,
        content: `Hunter! Rex the Raptor has spotted something in the valley. To plan the attack, you need to decode this ancient scroll: "${homeworkText}"`,
      },
      stage2: {
        title: world.terms.stage2,
        content: 'The raptors are counting their claws! Break the problem into pieces — just like a raptor breaks prey into bite-sized chunks. Work through each step carefully.',
      },
      stage3: {
        title: world.terms.stage3,
        content: 'RAWR! You did it, Hunter! Rex is roaring with pride! The pack celebrates your victory!',
      },
      hint: "The T-Rex needs more fuel to roar! Try breaking the numbers into smaller groups first.",
      rewardName: 'Golden Raptor Tooth',
      rewardDescription: 'A rare fossil from the mightiest raptor in the Dino-Wilds!',
      imagePrompt: 'cute cartoon velociraptors doing math on rocks in a jungle',
      simplifiedStep: 'Start by reading just the first number in the problem.',
    },
    'minecraftia': {
      questTitle: '⛏️ The Crafting Table Challenge',
      objective: 'Craft the solution to unlock the diamond chest!',
      stage1: {
        title: world.terms.stage1,
        content: `Crafter! Steve found a locked chest deep in the mines. The combination requires solving: "${homeworkText}"`,
      },
      stage2: {
        title: world.terms.stage2,
        content: 'Place the numbers in the crafting grid! Each calculation is like placing blocks — get the recipe right and the chest opens. Work step by step!',
      },
      stage3: {
        title: world.terms.stage3,
        content: 'Achievement Unlocked! The diamond chest is YOURS, Crafter!',
      },
      hint: "Check your crafting recipe! Try organizing the numbers differently.",
      rewardName: 'Enchanted Diamond',
      rewardDescription: 'The rarest gem in all of Minecraftia — yours forever!',
      imagePrompt: 'cute Minecraft Steve character doing math at a crafting table',
      simplifiedStep: 'Look at the first number — how much do we start with?',
    },
    'vacuum-city': {
      questTitle: '🤖 The Dirty Data Scan',
      objective: 'Clean up the data corruption to restore Vacuum City!',
      stage1: {
        title: world.terms.stage1,
        content: `Commander! Vac-9000 has detected dirty data in sector 7. The scan reveals: "${homeworkText}"`,
      },
      stage2: {
        title: world.terms.stage2,
        content: 'Activate cleaning protocol! Process the numbers systematically. Every correct step removes more dirt from the grid.',
      },
      stage3: {
        title: world.terms.stage3,
        content: 'BEEP-BOOP! Area cleaned! Vac-9000 charges back to the dock, Commander!',
      },
      hint: "Run a diagnostic! Re-check the numbers from the beginning.",
      rewardName: 'Charged Power Cell',
      rewardDescription: 'A fully powered cell for Vac-9000 — maximum cleaning strength!',
      imagePrompt: 'cute robot vacuum doing math calculations in a futuristic city',
      simplifiedStep: 'Scan just the first piece of data — what number do you see?',
    },
    'space-rangers': {
      questTitle: '🚀 The Orbital Equation',
      objective: 'Calculate the trajectory to save the space station!',
      stage1: {
        title: world.terms.stage1,
        content: `Ranger! Captain Nova has received a distress signal. The navigation computer needs you to solve: "${homeworkText}"`,
      },
      stage2: {
        title: world.terms.stage2,
        content: 'Fire up the thrusters! Work through the calculations step by step. One wrong number and we miss the station!',
      },
      stage3: {
        title: world.terms.stage3,
        content: 'Mission Complete! The crew is safe, Ranger! Captain Nova salutes you!',
      },
      hint: "Check your coordinates! Try calculating one variable at a time.",
      rewardName: 'Star Medal',
      rewardDescription: 'Awarded only to the bravest Rangers in the galaxy!',
      imagePrompt: 'astronaut solving math equations on a spaceship window with stars',
      simplifiedStep: 'Focus on just the first number in the problem.',
    },
    'pirate-seas': {
      questTitle: "🏴‍☠️ Cap'n Byte's Treasure Code",
      objective: "Decode the treasure map to find Cap'n Byte's gold!",
      stage1: {
        title: world.terms.stage1,
        content: `Buccaneer! Cap'n Byte found a coded treasure map. The first clue reads: "${homeworkText}"`,
      },
      stage2: {
        title: world.terms.stage2,
        content: "Navigate the high seas of numbers! Each correct calculation brings ye closer to the treasure. Keep yer compass steady!",
      },
      stage3: {
        title: world.terms.stage3,
        content: "Land Ahoy! The treasure is YOURS, Buccaneer! The whole crew cheers!",
      },
      hint: "Check yer map again! The treasure might be hidden in a different calculation order.",
      rewardName: 'Gold Doubloon',
      rewardDescription: "A genuine piece of eight from Cap'n Byte's legendary treasure chest!",
      imagePrompt: 'cute cartoon pirate parrot solving math on a treasure map',
      simplifiedStep: 'Read just the first number on the treasure map.',
    },
  };
  return demos[world.id] || demos['dino-wilds'];
}

export async function transformHomeworkToQuest(homeworkText, world, learningStyle, fixationLevel = 3) {
  const apiKey = await AsyncStorage.getItem('openai_api_key');
  if (!apiKey) return getDemoQuest(world, homeworkText);

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: buildSystemPrompt(world, learningStyle, fixationLevel) },
          { role: 'user', content: `Transform this homework into a quest: "${homeworkText}"` },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
      }),
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.warn('AI error, falling back to demo:', err.message);
    return getDemoQuest(world, homeworkText);
  }
}

export async function analyzeHomeworkImage(imageBase64, world, learningStyle, fixationLevel = 3) {
  const apiKey = await AsyncStorage.getItem('openai_api_key');
  if (!apiKey) return getDemoQuest(world, 'homework from photo');

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Read the homework problem in this image, then transform it into a quest for world "${world.name}" (guide: ${world.guide}). Learning style: ${learningStyle}. Theming depth (1-5): ${fixationLevel}.\n\nReturn ONLY valid JSON: { questTitle, objective, stage1:{title,content}, stage2:{title,content}, stage3:{title,content}, hint, rewardName, rewardDescription, imagePrompt, simplifiedStep }`,
              },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1500,
      }),
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.warn('Vision error, falling back to demo:', err.message);
    return getDemoQuest(world, 'homework from photo');
  }
}
