import { pipeline, env } from '@xenova/transformers';

// Skip local checks
env.allowLocalModels = false;

class SummarizerSingleton {
  static task = 'summarization' as const;
  static model = 'Xenova/distilbart-cnn-6-6';
  static instance: any = null;

  static async getInstance(progress_callback?: any) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

class ClassifierSingleton {
  static task = 'zero-shot-classification' as const;
  static model = 'Xenova/mobilebert-uncased-mnli';
  static instance: any = null;

  static async getInstance(progress_callback?: any) {
    if (this.instance === null) {
      this.instance = await pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  const { text, type } = event.data;

  try {
    if (type === 'summarize') {
      if (!text || text.trim().length === 0) {
        self.postMessage({ status: 'complete', type: 'summarize', result: '' });
        return;
      }

      const summarizer = await SummarizerSingleton.getInstance((x: any) => {
        self.postMessage({ status: 'progress', type: 'summarize', ...x });
      });

      const output = await summarizer(text, {
        max_new_tokens: 150,
      });

      self.postMessage({ status: 'complete', type: 'summarize', result: output[0].summary_text });
    } else if (type === 'classify') {
      if (!text || text.trim().length === 0) {
        self.postMessage({ status: 'complete', type: 'classify', result: [] });
        return;
      }

      const classifier = await ClassifierSingleton.getInstance((x: any) => {
        self.postMessage({ status: 'progress', type: 'classify', ...x });
      });

      const labels = ['technology', 'business', 'health', 'finance', 'education', 'meeting notes', 'creative writing', 'personal', 'todo', 'science'];
      const output = await classifier(text, labels);
      
      // Top 3 labels
      const tags = output.labels.slice(0, 3);
      self.postMessage({ status: 'complete', type: 'classify', result: tags });
    }
  } catch (e) {
    self.postMessage({ status: 'error', type, error: String(e) });
  }
});
