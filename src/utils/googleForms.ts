import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

let cachedFormsToken: string | null = null;

export function getFormsToken(): string | null {
  if (!cachedFormsToken) {
    cachedFormsToken = sessionStorage.getItem('google_access_token');
  }
  return cachedFormsToken;
}

export function setFormsToken(token: string | null) {
  cachedFormsToken = token;
  if (token) {
    sessionStorage.setItem('google_access_token', token);
  }
}

export async function signInForGoogleForms(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/forms.body');
  provider.addScope('https://www.googleapis.com/auth/drive.file');
  
  let result;
  if (auth.currentUser) {
    const { linkWithPopup } = await import('firebase/auth');
    try {
      result = await linkWithPopup(auth.currentUser, provider);
    } catch (linkErr: any) {
      if (linkErr.code === 'auth/credential-already-in-use') {
        result = await signInWithPopup(auth, provider);
      } else {
        throw linkErr;
      }
    }
  } else {
    result = await signInWithPopup(auth, provider);
  }
  
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const token = credential?.accessToken;
  if (!token) {
    throw new Error("Failed to retrieve Google Forms authorization token.");
  }
  cachedFormsToken = token;
  return token;
}

export interface FormQuestion {
  title: string;
  type: 'text' | 'paragraph' | 'multiple-choice';
  options?: string[];
}

export async function createGoogleForm(
  title: string, 
  questions: FormQuestion[], 
  token: string
): Promise<{ editUrl: string, responderUrl: string }> {
  // 1. Create a blank form
  const createRes = await fetch('https://forms.googleapis.com/v1/forms', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title: title,
        description: 'Exported securely from DocCraft Workspace.'
      }
    })
  });
  
  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create Google Form: ${errText}`);
  }
  
  const form = await createRes.json();
  const formId = form.formId;
  const editUrl = form.responderUri ? form.responderUri.replace('/viewform', '/edit') : `https://docs.google.com/forms/d/${formId}/edit`;
  const responderUrl = form.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`;
  
  // 2. Add questions using batchUpdate
  const requests: any[] = [];
  
  questions.forEach((q, index) => {
    const item: any = {
      title: q.title,
      questionItem: {
        question: {
          required: false
        }
      }
    };
    
    if (q.type === 'multiple-choice' && q.options && q.options.length > 0) {
      item.questionItem.question.choiceQuestion = {
        type: 'RADIO',
        options: q.options.map(opt => ({ value: opt }))
      };
    } else if (q.type === 'paragraph') {
      item.questionItem.question.textQuestion = {
        paragraph: true
      };
    } else {
      item.questionItem.question.textQuestion = {
        paragraph: false
      };
    }
    
    requests.push({
      createItem: {
        item,
        location: { index: index }
      }
    });
  });
  
  if (requests.length > 0) {
    const updateRes = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
    
    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.warn(`Could not add questions, fallback to empty form: ${errText}`);
    }
  }
  
  return { editUrl, responderUrl };
}

// Simple parser function that inspects tip tap HTML and extracts potential survey questions
export function parseQuestionsFromHtml(html: string): FormQuestion[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const questions: FormQuestion[] = [];
  
  // Find paragraphs, headings, list items
  const elements = doc.querySelectorAll('p, li, h1, h2, h3');
  elements.forEach(el => {
    const text = el.textContent?.trim() || '';
    if (!text) return;
    
    // Check if it ends with a question mark
    if (text.endsWith('?') && text.length > 5 && text.length < 150) {
      // Check if the next element is an ordered or unordered list (which represents options)
      const options: string[] = [];
      let sibling = el.nextElementSibling;
      if (sibling && (sibling.tagName.toLowerCase() === 'ul' || sibling.tagName.toLowerCase() === 'ol')) {
        sibling.querySelectorAll('li').forEach(li => {
          const optText = li.textContent?.trim() || '';
          if (optText) options.push(optText);
        });
      }
      
      if (options.length > 0) {
        questions.push({
          title: text,
          type: 'multiple-choice',
          options
        });
      } else {
        questions.push({
          title: text,
          type: text.length > 80 ? 'paragraph' : 'text'
        });
      }
    }
  });
  
  // If no questions found, fallback to headings or simple default questions
  if (questions.length === 0) {
    const headings = doc.querySelectorAll('h1, h2, h3');
    headings.forEach(h => {
      const text = h.textContent?.trim() || '';
      if (text && text.length < 100) {
        questions.push({
          title: `Describe your thoughts on: ${text}`,
          type: 'paragraph'
        });
      }
    });
  }
  
  // Limit to at most 12 questions
  return questions.slice(0, 12);
}
