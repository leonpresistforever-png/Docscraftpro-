import { create, insert, search, Orama } from '@orama/orama';

export interface SearchDoc {
  id: string;
  title: string;
  content: string;
  tags?: string;
}

let dbInstance: Orama<any> | null = null;

export async function getOramaDb() {
  if (!dbInstance) {
    dbInstance = await create({
      schema: {
        id: 'string',
        title: 'string',
        content: 'string',
        tags: 'string',
      }
    });
  }
  return dbInstance;
}

export async function indexDocuments(docs: SearchDoc[]) {
  // Recreate the instance to "clear" it for fresh indexing
  dbInstance = await create({
    schema: {
      id: 'string',
      title: 'string',
      content: 'string',
      tags: 'string',
    }
  });
  
  const db = await getOramaDb();
  for (const doc of docs) {
    
    // Extract plain text if content is TipTap JSON string
    let plainContent = doc.content || '';
    if (plainContent.startsWith('{') && plainContent.includes('"type":"doc"')) {
        try {
            const parsed = JSON.parse(plainContent);
            // Recursive function to extract text
            const extractText = (node: any): string => {
                let text = '';
                if (node.text) text += node.text + ' ';
                if (node.content) {
                    node.content.forEach((child: any) => {
                        text += extractText(child);
                    });
                }
                return text;
            };
            plainContent = extractText(parsed);
        } catch (e) {
            // fallback
        }
    }

    await insert(db, {
      id: doc.id,
      title: doc.title || 'Untitled',
      content: plainContent,
      tags: doc.tags || ''
    });
  }
  console.log(`[Orama] Indexed ${docs.length} documents.`);
}

export async function searchOrama(term: string) {
  if (!term.trim()) return [];
  const db = await getOramaDb();
  const results = await search(db, {
    term,
    properties: ['title', 'content', 'tags'],
    tolerance: 1, // typo-tolerant
    limit: 10,
  });
  return results.hits.map(hit => hit.document);
}

export function isSemanticSearchEnabled(): boolean {
  return localStorage.getItem('orama_search_enabled') === 'true';
}

export function setSemanticSearchEnabled(enabled: boolean) {
  localStorage.setItem('orama_search_enabled', enabled ? 'true' : 'false');
}
