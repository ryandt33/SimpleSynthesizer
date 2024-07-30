import fs from "fs";
import dotenv from "dotenv";
import call from "./openai.mjs";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

const data = fs
  .readFileSync("nonDupedList.jsonl", "utf8")
  .split("\n")
  .filter((i) => i)
  .map(JSON.parse);

const systemPrompt = `Your job is to output a conversation between a tutor and a student.

The student is trying to brainstorm an essay thesis about the given topic.

The tutor is helping to guide the student's thinking.`;

const chain = [
  {
    role: "user",
    content:
      "Essay Topic:  The Insecurity of Authoritarianism in the novel 1984.",
  },
  {
    role: "assistant",
    content: `{conversation:[
    {
        "role": "student",
        "content": "I need help thinking of a thesis for an essay about 'The Insecurity of Authoritarianism in the novel 1984'."
    },
    {
        "role": "tutor",
        "content": "That's a really interesting topic! Can you tell me a little bit about what that topic means? What does 'the insecurity of authoritarianism' mean?"
    },
    {
        "role": "student",
        "content": "Well insecurity means they feel anxious and uncomfortable."
    },
    {
        "role": "tutor",
        "content": "Ok, so how about authoritarian? Do you know what that means?"
    },
    {
        "role": "student",
        "content": "Not really, but the government in 1984 is all about control, so I guess it's about authority and control."
    },
    {
        "role": "tutor",
        "content": "That's a great connection, you're right, authoritarian governments use their authority to control many aspects in a society. Can you think about how that connects to insecurity?"
    },
    {
        "role": "student",
        "content": "No..."
    },
    {
        "role": "tutor",
        "content": "How about in your own life? When do you feel insecure?"
    },
    {
        "role": "student",
        "content": "Maybe about an upcoming test?"
    },
    {
        "role": "tutor",
        "content": "So when you have a test coming up, and you feel insecure or anxious, what do you do?"
    },
    {
        "role": "student",
        "content": "I try and study and stuff, learn as much as I can."
    },
    {
        "role": "tutor",
        "content": "That's great, you try and control the situation by changing it. What do you think the government in 1984 feels anxious about?"
    },
    {
        "role": "student",
        "content": "Losing power."
    },
    {
        "role": "tutor",
        "content": "Awesome! Ok, I think you're almost there, why don't you try and tell me again what you think 'The Insecurity of Authoritarianism'."
    },
    {
        "role": "student",
        "content": "It means that the government in 1984 doesn't feel like they have a strong hold of power, so that's why they are so strong and crazy."
    },
    {
        "role": "tutor",
        "content": "Great! Now, try to write an essay thesis that uses these ideas, but references specific examples in the novel."
    }
]}`,
  },
  {
    role: "user",
    content: `Essay Topic: "Acknowledgement and the Other, Racism in Contemporary America" as seen through the Invisible Man by Ralph Ellison`,
  },
  {
    role: "assistant",
    content: `{conversation: 
[
    {
        "role": "student",
        "content": "My teacher wants me to write an essay about 'Acknowledgement and the Other, Racism in Contemporary America' as seen through the Invisible Man by Ralph Ellison."
    },
    {
        "role": "tutor",
        "content": "That's a deep topic. Can you tell me, what does 'Acknowledgement and the Other' mean to you?"
    },
    {
        "role": "student",
        "content": "I don't know, like saying hi to other people?"
    },
    {
        "role": "tutor",
        "content": "Hmm, well let's look at the other part of the topic, 'Racism in Contemporary America'. What about the 'Invisible Man' talks about racism."
    },
    {
        "role": "student",
        "content": "Well, the whole book is about racism I guess. The main character has a pretty hard time."
    },
    {
        "role": "tutor",
        "content": "Can you give me some examples?"
    },
    {
        "role": "student",
        "content": "Well at the beginning, the main character is supposed to give this speech because he did well in school and stuff, but the white people just make him fight."
    },
    {
        "role": "tutor",
        "content": "That's a really interesting example. So what do you think the main character wanted to have acknowledged at the beginning of the book?"
    },
    {
        "role": "student",
        "content": "That he was capable and had dignity, but they weren't really willing to see him like this."
    },
    {
        "role": "tutor",
        "content": "Yeah, that's a really good observation. So using this example, who do you think is 'the other', the white people or the main character and other African American youths?"
    },
    {
        "role": "student",
        "content": "It's the white people, because they are so different from the main character."
    },
    {
        "role": "tutor",
        "content": "You're right, they are definitely an 'other' compared to the main character, but usually we use this term to refer to 'society's' other. Who holds the dominant role in society."
    },
    {
        "role": "student",
        "content": "Oh, that's definitely the main character. I guess people don't acknowledge him throughout the novel."
    },
    {
        "role": "tutor",
        "content": "Great, I think you're starting to get a clear idea of where your essay can go."
    }
]}`,
  },
];

const main = async () => {
  while (data.length < 1000) {
    console.log(data.length);
    const topicListSoFar = data.map((d) => d.topic);
    const userPrompt = `Your job is to create a list of 10 essay topics that a high school English student might have to answer.
        
For example:
1. "The Insecurity of Authoritarianism in the novel 1984."
2. "Acknowledgement and the Other, Racism in Contemporary America" as seen through the Invisible Man by Ralph Ellison.

${
  topicListSoFar.length > 0
    ? `These topics have already been suggested, so do not reuse them: \n${topicListSoFar.join(
        "\n"
      )}`
    : ""
}

Return your list in the following JSON format: {topics: ["topic1", "topic2", ...]}`;

    const topicsRes = await call(
      {
        systemPrompt: "",
        userPrompt: [{ role: "user", content: userPrompt }],
        temperature: 1,
        jsonOutput: true,
        model: "gpt-4o-mini",
      },
      apiKey
    );

    const topics = JSON.parse(topicsRes).topics;

    await Promise.all(
      topics.map(async (topic) => {
        if (topicListSoFar.includes(topic)) return;
        const newChain = await call(
          {
            systemPrompt,
            userPrompt: [
              ...chain,
              {
                role: "user",
                content: `Essay Topic: "${topic}"\n\nOutput in the following JSON format: {conversation:[{role: 'role', content: 'content'}...,]}`,
              },
            ],
            temperature: 0.5,
            jsonOutput: true,
            model: "gpt-4o-mini",
          },
          apiKey
        );

        data.push({
          topic,
          chain: JSON.parse(newChain).conversation,
          text: JSON.parse(newChain).conversation.reduce(
            (acc, c) =>
              acc +
              `<|start_header_id|>${
                c.role === "student" ? "user" : "assistant"
              }<|end_header_id|>\n\n${c.content}<|eot_id|>`,
            "<|start_header_id|>system<|end_header_id|>\n\nYour job is to help a student brainstorm an essay thesis about the given topic.<|eot_id|>"
          ),
        });
      })
    );

    fs.writeFileSync("nonDupedList.jsonl", data.map(JSON.stringify).join("\n"));
  }
};

main();
