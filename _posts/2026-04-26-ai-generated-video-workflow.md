---
title: "Making short AI videos without losing the plot completely"
layout: post
is_series: false
description: "A quick overview of this past weekend's workflow for making short AI-generated videos with Gemini, Nano Banana, Higgsfield, Seedance, CapCut, and Veed."
date: "2026-04-26"
categories: ["coding", "ai"]
published: true
slug: ai-generated-video-workflow
featured-image: "/assets/post-media/ai-generated-video-workflow/header.webp"
featured-thumbnail: "/assets/post-media/ai-generated-video-workflow/header-sm.webp"
featured_image_width: 1600
featured_image_height: 528
---

## What you'll learn

- How I currently break AI video ideas into short scenes.
- Why script and reference images matter before spending generation credits.
- Why credits disappear quickly when a 15-second generation needs rerunning.

I have been making some AI-generated videos this weekend.

This is not a grand theory of cinema. No one from Cannes has called, so to speak...

But the tools are now good enough that you can make short, strange, surprisingly usable clips without a production crew. The trade-off is that you become the production crew. Also the casting department. Also continuity. Also the person muttering "why is my face melting again?" at midnight.

This post is a quick overview of the workflow. Each step could be its own post later, because every tool has its own special way of making you feel like you are one checkbox away from greatness.

## The AI Twin Trilogy

The main experiment is a three-part story about AI Viktor trying to take over for real Viktor.

<div class="video-series" aria-label="AI Twin video series">
  <figure class="video-embed video-embed--feature">
    <video controls preload="metadata" playsinline poster="/assets/post-media/ai-generated-video-workflow/ai_twin_1_subtitles-poster.webp">
      <source src="/assets/post-media/ai-generated-video-workflow/ai_twin_1_subtitles-baseline.mp4" type="video/mp4" />
    </video>
    <figcaption>
      <strong>Part 1:</strong> AI Viktor takes the chair and explains that lazy real Viktor is sleeping. Rude, but not entirely unsupported by evidence.
    </figcaption>
  </figure>

  <figure class="video-embed video-embed--feature">
    <video controls preload="metadata" playsinline poster="/assets/post-media/ai-generated-video-workflow/ai_twin_2_subtitles-poster.webp">
      <source src="/assets/post-media/ai-generated-video-workflow/ai_twin_2_subtitles-web.mp4" type="video/mp4" />
    </video>
    <figcaption>
      <strong>Part 2:</strong> Real Viktor wakes up, brings actual experience and coffee, and asks the synthetic intern to calm down.
    </figcaption>
  </figure>

  <figure class="video-embed video-embed--feature">
    <video controls preload="metadata" playsinline poster="/assets/post-media/ai-generated-video-workflow/ai_twin_3-poster.webp">
      <source src="/assets/post-media/ai-generated-video-workflow/ai_twin_3.mp4" type="video/mp4" />
    </video>
    <figcaption>
      <strong>Part 3:</strong> The tone shifts. The joke gets darker. The helpful assistant has read the roadmap and found management.
    </figcaption>
  </figure>
</div>

## Other Cinematic Experiments

These are a few clips I made with my partner as the other main character. They are less "AI takes my job" and more "what if our weekend plans had a visual effects budget and mild narrative instability?"

<div class="video-grid" aria-label="AI video examples with my partner">
  <figure class="video-embed">
    <video controls preload="metadata" playsinline poster="/assets/post-media/ai-generated-video-workflow/catwoman_wolverine_subtitles-poster.webp">
      <source src="/assets/post-media/ai-generated-video-workflow/catwoman_wolverine_subtitles-web.mp4" type="video/mp4" />
    </video>
    <figcaption>Superhero energy. Not legally superhero energy, obviously. Just vibes wearing a cape.</figcaption>
  </figure>

  <figure class="video-embed">
    <video controls preload="metadata" playsinline poster="/assets/post-media/ai-generated-video-workflow/bridge_collapse-poster.webp">
      <source src="/assets/post-media/ai-generated-video-workflow/bridge_collapse-web.mp4" type="video/mp4" />
    </video>
    <figcaption>A cinematic disaster beat, because apparently even synthetic infrastructure has maintenance issues.</figcaption>
  </figure>

  <figure class="video-embed">
    <video controls preload="metadata" playsinline poster="/assets/post-media/ai-generated-video-workflow/neural_fracture-poster.webp">
      <source src="/assets/post-media/ai-generated-video-workflow/neural_fracture-web.mp4" type="video/mp4" />
    </video>
    <figcaption>More abstract and moody. The kind of title that suggests someone has made a poor decision near a server rack.</figcaption>
  </figure>

  <figure class="video-embed">
    <video controls preload="metadata" playsinline poster="/assets/post-media/ai-generated-video-workflow/two_minutes_to_midnight-poster.webp">
      <source src="/assets/post-media/ai-generated-video-workflow/two_minutes_to_midnight-web.mp4" type="video/mp4" />
    </video>
    <figcaption>Dramatic countdown energy. Very useful if your calendar reminders are not theatrical enough.</figcaption>
  </figure>

  <figure class="video-embed">
    <video controls preload="metadata" playsinline poster="/assets/post-media/ai-generated-video-workflow/vertigo_asset_recovery-poster.webp">
      <source src="/assets/post-media/ai-generated-video-workflow/vertigo_asset_recovery-web.mp4" type="video/mp4" />
    </video>
    <figcaption>Cinematic recovery scene with the usual AI-video suspicion that physics was invited late and left early.</figcaption>
  </figure>
</div>

## How I Show The Videos On This Site

1. Keep X and LinkedIn posts as external links for discovery (only the AI twin arc).
2. Export compressed web versions of the videos.
3. Host those files directly on this site (could have used a proper video host/CDN if files were larger).
4. Embed with the native HTML `<video>` element.

For a static Jekyll site, the clean version is something like:

```html
<figure class="video-embed">
  <video
    controls
    preload="metadata"
    playsinline
    poster="/assets/post-media/ai-generated-video-workflow/ai-viktor-poster.webp"
  >
    <source
      src="/assets/post-media/ai-generated-video-workflow/ai-viktor.mp4"
      type="video/mp4"
    />
  </video>
  <figcaption>AI Viktor explaining that real Viktor has outsourced himself badly.</figcaption>
</figure>
```

That gives you:

- reliable playback
- normal browser controls
- no social-platform JavaScript
- no mystery iframe layout
- control over posters, captions, and page performance

The trade-off is bandwidth. If the videos are large, self-hosting several of them can get heavy fast. In that case I would either use a proper video service or keep the embedded videos short and link out to the full versions.

## 1. Start With The Script

I started by working out the script in an AI chat. In my case, a lot of it happened in Gemini.

The important part was not just "write me a funny AI video". The better approach was to work through:

- the premise
- the character conflict
- the tone of each scene
- what each clip needs to show visually
- what the spoken line should be
- what can realistically fit in a few seconds

Obviously you can get AI to help out with most of the above as well.

One of my early mistakes was asking for scenes that were too long.

Long AI video generations are expensive, harder to control, and annoying to fix. If one detail is wrong, you often need to regenerate the whole thing. There is nothing quite like paying to watch your digital face confidently perform the wrong scene in the wrong room with the wrong jacket.

So now I ask the AI to split the script into roughly five-second batches.

In the beginning, I tried prompts that were basically a small production bible stapled to a prayer. Something like this:

```text
A single, locked-off master shot of the high-end minimalist office from
[OFFICE_REFERENCE_IMAGE] in a Netflix documentary close-up style.

The video begins with Alert Viktor [ALERT_VIKTOR_CHARACTER_REFERENCE] sitting
in the office chair, matching the reference image. Identical realism and
hairstyle to the provided character reference. Strictly no cartoon styles. No
slicked-back hair.

He looks directly at the lens. To show he is an AI, he appears perfectly human
and realistic, except for an almost imperceptible detail in his eyes: his pupils
do not dilate or constrict, and they maintain a tiny, static digital
aperture-like pattern. Subtle, dark, no glow. This gives him a slightly inhuman
fixed gaze. Except for that, he looks identical to the reference.

Suddenly, Tired Viktor [TIRED_VIKTOR_CHARACTER_REFERENCE], messy hair and tired
face, enters from the left and puts a hand on Alert Viktor's shoulder.

Tired Viktor's anatomy must be precise: his right hand is steadily holding a
ceramic coffee mug with rising steam, and it stays in that hand throughout the
entire video. His left hand is used once to tap Alert Viktor on the shoulder.
Tired Viktor's mouth moves as he speaks his opening line calmly, perfectly
lip-synced.

Alert Viktor briefly glitches and dissolves into abstract computational digital
noise and data streams before vanishing from the chair. Tired Viktor sits down,
fills the space, maintains his messy morning look, and keeps holding the steaming
coffee mug throughout the entire scene.

He rubs his eyes wearily and then looks directly into the lens to deliver his
lines. His mouth sync must be perfectly accurate to the dialogue. Crucially,
Tired Viktor must continue speaking and maintaining active lip-sync until the
very last word of the script is uttered. The lip-sync must remain high-priority
for the full 15 seconds. He does not sip the coffee at all.

High-resolution, 4k, hyper-realistic, strictly no cartoon styles.

Integrated Script / Audio:
Sound of Tired Viktor entering. He says: "Get out", followed by a sudden, clean
computational data-burst sound from Alert Viktor as Alert Viktor disappears in
the glitch.

Tired Viktor, now sitting in the chair:
"Alright, I'm awake. Ugh. Okay, I clearly needed that extra hour. He's got the
infinite energy, but I've got actual years of industry experience... and this
coffee. So, if you want a demo with the guy who actually writes the code and
occasionally needs a nap, I'm your man. Let's get to work."

Strictly no extra or phantom limbs. Make sure Tired Viktor's hair stays
consistently messy through the whole video.
```

It can work, but if one tiny thing fails, the whole clip is compromised. Maybe the coffee mug disappears. Maybe the wrong Viktor sits down. Maybe the glitch is perfect but the face is not.

Also notice the added negative prompts for phantom limbs, as I had some issues witht the hand on shoulder being a third hand... You will see issues like this, and will have to build out the prompt as you go.

The better version is much smaller. Example from a later video:

For wide cinematic shots, I also learned to separate the visual idea from the entire story. A later prompt might look more like this:

```text
Extreme wide shot, low angle.
A vast dark blue night sky with heavy cloud formations fills the frame.
Massive black silhouettes of monolithic high-rise buildings tower against a
blurred metropolitan skyline with small lights below.

Action:
Two small silhouettes, one lithe and athletic and one broad and powerful, sprint
across the edge of the tallest building. A huge orange-yellow blast blooms behind
them, throwing their black outlines into sharp relief. They leap from the roof
toward a slightly lower adjacent rooftop.

Style:
High-contrast noir, epic scale, heavy atmospheric haze, motion blur on the blast,
minimal character detail, cinematic.

Duration:
5 seconds.
```

## 2. Create Reference Images First

Before generating video, I like to create atmospheric still images.

These are not always used directly in the final video, but they help define what I am going for, and can be used as elements in Seedance:

- environment
- lighting
- mood
- framing
- outfit
- character position
- camera style

I used Nano Banana for this, but the specific image tool is not the point. The point is to have visual anchors before spending video credits.

For the AI Viktor series, I wanted that slightly too-serious documentary look with interview framing.

## 3. Create The Characters

For the character cloning, I used Higgsfield.ai.

The process was to upload around 30 to 40 images per person I wanted to recreate. That means different angles, lighting, expressions, and ideally lots of variety.

## 4. Generate Short Scenes In Seedance

Once the script chunks and reference images were ready, I used the characters in Seedance 2.0, available inside Higgsfield.ai.

The prompt for each scene came from the script work in Gemini, then I adjusted it for the video tool.

I have tried a few models, and right now Seedance 2.0 gives me much better results than Kling for this kind of work.

The difference is especially noticeable in:

- lighting
- likeness to the character references
- keeping the same person looking like the same person
- cinematic movement

Most useful lesson: keep scenes short. Four to six seconds seems to be the sweet spot right now. 

## 5. Edit Everything Together In CapCut

After generating the clips, I pulled everything into CapCut.

CapCut is good enough for:

- trimming clips
- arranging the sequence
- adding cuts
- adjusting pacing
- adding music or sound effects
- removing dead air
- making the whole thing feel intentional, even when several parts were absolutely not intentional

The edit matters a lot. The rhythm needs help.

## 6. Add Sound Effects And Music

After the edit started to work visually, I added sound effects and music.

For that, I used [Freesound](http://freesound.org/).

## 7. Add Subtitles In Veed

Finally, I used Veed.io to add subtitles automatically.

## Takeaways So Far

Use short scenes.

Create reference images before generating video.

Expect to regenerate.

Expect to pay more than you planned.

And maybe do more voice testing than I have done so far. Voice is still tricky. I should probably spend more time with ElevenLabs and see if that gives better control.

## Costs And The Annoying Economics Of Experimenting

This gets expensive quickly.

At the moment, I pay for the Ultra plan on Higgsfield.ai. That is `129 USD` per month and includes `3000` credits.

That sounds like a lot of credits until you start using them.

With Seedance 2.0, the rough cost is:

- `5s` clip: `55` credits
- `10s` clip: `110` credits
- `15s` clip: `165` credits

In the beginning, I generated `15s` clips because it felt efficient.

It was not efficient.

If you need to fix the smallest thing, you usually have to reprompt and rerun. Six failed `15s` attempts and you have burned almost `1000` credits. That is a very fast way to turn curiosity into a spreadsheet.

And then there are top-ups. Higgsfield lets me top up `2000` credits at a time for `95 USD`.

## Final Thought

The weird thing about AI video is not that it replaces the whole process.

It does not.

You still need writing, direction, taste, timing, and editing skills, most of which I do not have. What I do have is enough patience to regenerate a scene until it behaves.