import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

let cachedSlidesToken: string | null = null;

export function getSlidesToken(): string | null {
  if (!cachedSlidesToken) {
    cachedSlidesToken = sessionStorage.getItem('google_access_token');
  }
  return cachedSlidesToken;
}

export function setSlidesToken(token: string | null) {
  cachedSlidesToken = token;
  if (token) {
    sessionStorage.setItem('google_access_token', token);
  }
}

export async function signInForGoogleSlides(): Promise<string> {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/presentations');
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
    throw new Error("Failed to retrieve Google Slides authorization token.");
  }
  cachedSlidesToken = token;
  return token;
}

export async function createGoogleSlidePresentation(
  title: string, 
  slides: { heading: string, bullets: string[] }[], 
  token: string
): Promise<string> {
  // 1. Create a blank presentation
  const createRes = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title })
  });
  
  if (!createRes.ok) {
    const errText = await createRes.ok ? '' : await createRes.text();
    throw new Error(`Failed to create Presentation: ${errText}`);
  }
  
  const presentation = await createRes.json();
  const presentationId = presentation.presentationId;
  const requests: any[] = [];
  
  // A newly created presentation has a single default title slide (at index 0). Let's edit it.
  const firstSlideId = presentation.slides?.[0]?.objectId;
  if (firstSlideId && slides.length > 0) {
    const firstSlideData = slides[0];
    
    // We can add text box to the first slide
    const titleBoxId = `title_box_first`;
    const subtitleBoxId = `subtitle_box_first`;
    
    requests.push({
      createShape: {
        objectId: titleBoxId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageId: firstSlideId,
          size: {
            height: { magnitude: 110, unit: 'PT' },
            width: { magnitude: 550, unit: 'PT' }
          },
          transform: {
            scaleX: 1, scaleY: 1, translateX: 80, translateY: 110, unit: 'PT'
          }
        }
      }
    }, {
      insertText: {
        objectId: titleBoxId,
        text: firstSlideData.heading
      }
    }, {
      updateTextStyle: {
        objectId: titleBoxId,
        style: {
          bold: true,
          fontSize: { magnitude: 34, unit: 'PT' },
          fontFamily: 'Arial',
          foregroundColor: { opaqueColor: { rgbColor: { red: 0.15, green: 0.15, blue: 0.2 } } }
        },
        textRange: { type: 'ALL' },
        fields: 'bold,fontSize,fontFamily,foregroundColor'
      }
    });
    
    if (firstSlideData.bullets.length > 0) {
      requests.push({
        createShape: {
          objectId: subtitleBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageId: firstSlideId,
            size: {
              height: { magnitude: 180, unit: 'PT' },
              width: { magnitude: 550, unit: 'PT' }
            },
            transform: {
              scaleX: 1, scaleY: 1, translateX: 80, translateY: 240, unit: 'PT'
            }
          }
        }
      }, {
        insertText: {
          objectId: subtitleBoxId,
          text: firstSlideData.bullets.join('\n')
        }
      }, {
        updateTextStyle: {
          objectId: subtitleBoxId,
          style: {
            fontSize: { magnitude: 15, unit: 'PT' },
            fontFamily: 'Arial'
          },
          textRange: { type: 'ALL' },
          fields: 'fontSize,fontFamily'
        }
      });
    }
  }
  
  // 2. Add remaining slides as separate BLANK slides
  for (let i = 1; i < slides.length; i++) {
    const slideData = slides[i];
    const slideId = `slide_${i}_${Date.now()}`;
    const headingBoxId = `heading_${i}_${Date.now()}`;
    const bodyBoxId = `body_${i}_${Date.now()}`;
    
    requests.push({
      createSlide: {
        objectId: slideId,
        slideLayoutReference: { predefinedLayout: 'BLANK' }
      }
    });
    
    // Add slide Heading box
    requests.push({
      createShape: {
        objectId: headingBoxId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageId: slideId,
          size: {
            height: { magnitude: 75, unit: 'PT' },
            width: { magnitude: 600, unit: 'PT' }
          },
          transform: {
            scaleX: 1, scaleY: 1, translateX: 50, translateY: 40, unit: 'PT'
          }
        }
      }
    }, {
      insertText: {
        objectId: headingBoxId,
        text: slideData.heading
      }
    }, {
      updateTextStyle: {
        objectId: headingBoxId,
        style: {
          bold: true,
          fontSize: { magnitude: 24, unit: 'PT' },
          foregroundColor: { opaqueColor: { rgbColor: { red: 0.1, green: 0.1, blue: 0.15 } } }
        },
        textRange: { type: 'ALL' },
        fields: 'bold,fontSize,foregroundColor'
      }
    });
    
    // Add slide Bullets box
    if (slideData.bullets.length > 0) {
      const bodyText = slideData.bullets.map(b => `• ${b}`).join('\n');
      requests.push({
        createShape: {
          objectId: bodyBoxId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageId: slideId,
            size: {
              height: { magnitude: 250, unit: 'PT' },
              width: { magnitude: 600, unit: 'PT' }
            },
            transform: {
              scaleX: 1, scaleY: 1, translateX: 50, translateY: 130, unit: 'PT'
            }
          }
        }
      }, {
        insertText: {
          objectId: bodyBoxId,
          text: bodyText
        }
      }, {
        updateTextStyle: {
          objectId: bodyBoxId,
          style: {
            fontSize: { magnitude: 14, unit: 'PT' },
            lineSpacing: 115,
            foregroundColor: { opaqueColor: { rgbColor: { red: 0.2, green: 0.2, blue: 0.2 } } }
          },
          textRange: { type: 'ALL' },
          fields: 'fontSize,lineSpacing,foregroundColor'
        }
      });
    }
  }
  
  // Submit formatting requests
  if (requests.length > 0) {
    const updateRes = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ requests })
    });
    
    if (!updateRes.ok) {
      const errText = await updateRes.text();
      throw new Error(`Failed to apply slide contents: ${errText}`);
    }
  }
  
  return `https://docs.google.com/presentation/d/${presentationId}/edit`;
}
