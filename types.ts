
export interface StoryChapter {
  title: string;
  content: string;
}

export interface Story {
  title: string;
  subtitle: string;
  chapters: StoryChapter[];
  conclusion: {
    title: string;
    content: string;
  };
}
