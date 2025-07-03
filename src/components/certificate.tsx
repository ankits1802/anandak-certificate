
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { translations } from "@/lib/assessment-data";
import { toTitleCase } from "@/lib/utils";

// Type definitions moved inline as requested files don't exist
export interface UserInfo {
  name: string;
  name_hi: string;
  state: string;
  district: string;
}

export interface AnswerDetail {
  id: number;
  trait: 'Gratitude' | 'Resilience' | 'Empathy' | 'Sociability' | 'Social Cognition' | 'Courage';
  score: number;
  feedback: string;
}

export interface CertificateData extends UserInfo {
  date: string;
  assessmentData: AnswerDetail[];
  finalAssessmentText: string;
}

interface CertificateProps {
  data: CertificateData;
}

interface CertificateContentProps {
  data: CertificateData;
  lang: 'en' | 'hi';
}

const formatDateHindi = (dateString: string): string => {
    const hindiMonths: { [key: string]: string } = {
        'January': 'जनवरी', 'February': 'फ़रवरी', 'March': 'मार्च', 'April': 'अप्रैल',
        'May': 'मई', 'June': 'जून', 'July': 'जुलाई', 'August': 'अगस्त',
        'September': 'सितंबर', 'October': 'अक्टूबर', 'November': 'नवंबर', 'December': 'दिसंबर'
    };

    const devanagariDigits: { [key: string]: string } = {
        '0': '०', '1': '१', '2': '२', '3': '३', '4': '४',
        '5': '५', '6': '६', '7': '७', '8': '८', '9': '९'
    };

    const toDevanagari = (numStr: string) => numStr.split('').map(digit => devanagariDigits[digit] || digit).join('');

    try {
        const date = new Date(dateString);
        const day = date.getDate().toString();
        const year = date.getFullYear().toString();
        const month = date.toLocaleString('en-US', { month: 'long' });
        
        const hindiMonth = hindiMonths[month];
        const hindiDay = toDevanagari(day);
        const hindiYear = toDevanagari(year);

        if (hindiMonth && hindiDay && hindiYear) {
            return `${hindiDay} ${hindiMonth}, ${hindiYear}`;
        }
    } catch (e) {
        console.error("Could not format date to Hindi:", e);
    }
    
    return dateString;
};


const CertificateContent = ({ data, lang }: CertificateContentProps) => {
  const t = translations[lang];
  const detailedResults = data.assessmentData.filter(item => item.trait !== 'Courage');

  const [transliteratedState, setTransliteratedState] = useState(data.state);
  const [transliteratedDistrict, setTransliteratedDistrict] = useState(data.district);

  useEffect(() => {
    if (lang === 'hi') {
        const transliterateText = async (text: string, setter: React.Dispatch<React.SetStateAction<string>>) => {
            if (!text || text === 'N/A') return;
            try {
                const response = await fetch('/api/transliterate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text }),
                });
                if (response.ok) {
                    const result = await response.json();
                    if (result.transliteration) {
                        setter(result.transliteration);
                    }
                } else {
                  console.error("Transliteration API call failed for", text);
                }
            } catch (error) {
                console.error("Transliteration failed for", text, error);
            }
        };
        transliterateText(toTitleCase(data.state), setTransliteratedState);
        transliterateText(toTitleCase(data.district), setTransliteratedDistrict);
    }
  }, [lang, data.state, data.district]);


  const getPrefixedName = (name: string) => {
    return `Mr./Ms. ${name}`;
  };

  const getPrefixedNameHi = (name_hi: string) => {
    const nameToUse = name_hi || data.name;
    return `श्री/सुश्री ${nameToUse}`;
  };

  const prefixedName = lang === 'hi'
    ? getPrefixedNameHi(data.name_hi)
    : getPrefixedName(data.name);

  const formattedDate = new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className={`printable-area cert-page cert-${lang} font-sans w-full max-w-4xl bg-white text-black rounded-none shadow-2xl p-8 my-4 border-[16px] border-amber-400`}>
       <header className="flex justify-between items-center mb-8 flex-nowrap whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div data-ai-hint="logo government">
            <Image
              src="/mp-logo.svg"
              alt="Anandak Sansthan Logo"
              width={56}
              height={56}
              className="flex-shrink-0"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold font-sans">
              राज्य आनंद संस्थान
            </h1>
            <p className="text-base font-sans">
              मध्यप्रदेश शासन
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <h1 className="text-base font-semibold font-sans">
              Indian Institute of Technology, Kharagpur
            </h1>
            <p className="text-sm font-sans">
              भारतीय प्रौद्योगिकी संस्थान, खड़गपुर
            </p>
          </div>
          <div data-ai-hint="logo university">
            <Image
              src="/iit-kgp-logo.png"
              alt="IIT Kharagpur Logo"
              width={56}
              height={56}
              className="flex-shrink-0"
            />
          </div>
        </div>
      </header>
      <div className="cert-title-section text-center space-y-2 my-6">
          <h1 className="text-4xl font-bold text-amber-500 tracking-wide">
            {t.certTitle}
          </h1>

          {lang === 'en' && <p className="text-lg text-gray-600 mt-4">{t.certPresentedTo}</p>}

          <h2 className="text-3xl font-bold text-black flex items-baseline justify-center gap-2">
            <span>{prefixedName}</span>
            {lang === 'hi' && <span className="text-2xl font-normal">को</span>}
          </h2>
          
          {lang === 'hi' && <p className="text-lg text-gray-600">{t.certPresentedTo}</p>}
      </div>


      <Separator className="my-6 bg-gray-300 h-[2px]" />

      <main className="cert-content-section text-left space-y-6 text-base">
        <p className="leading-relaxed text-center">
          {lang === 'en' ? (
              <>
                  This is to certify that <span className="font-bold">{prefixedName}</span>, resident of <span className="font-bold">{toTitleCase(data.district)}, {toTitleCase(data.state)}</span>, has successfully completed the Anandak Assessment on <span className="font-bold">{formattedDate}</span>.
              </>
          ) : (
              <>
                  {t.certLine1_p1} <span className="font-bold">{prefixedName}</span>, {t.certLine1_p2} <span className="font-bold">{transliteratedDistrict}, {transliteratedState}</span> {t.certLine1_p3} <span className="font-bold">{formatDateHindi(data.date)}</span> {t.certLine1_p4}
              </>
          )}
        </p>

        <div className="pt-4">
            <h3 className="font-bold text-2xl mb-4">{t.detailedResults}</h3>
            <div className="space-y-3">
                {detailedResults.map(item => (
                    <div key={item.id}>
                        <p className="font-semibold text-lg">{t.traits[item.trait]}: <span className="font-normal">{t.score} {item.score}/3</span></p>
                        {item.score > 0 && (
                            <blockquote className="pl-4 border-l-4 border-gray-200 mt-1">
                                <p className="text-gray-700 italic">"{lang === 'en' ? item.feedback : (t.feedback[item.trait]?.[item.score as keyof typeof t.feedback[typeof item.trait]] || item.feedback)}"</p>
                            </blockquote>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <p className="leading-relaxed pt-4">
            <strong className="font-semibold">{t.assessmentSummary}</strong> {lang === 'en' ? data.finalAssessmentText : t.finalAssessment(data.finalAssessmentText)}
        </p>
      </main>
      
      <footer className="cert-footer-section mt-16 flex justify-between items-end text-black">
          <div className="text-center">
              <p className="font-bold text-lg border-t-2 border-gray-400 pt-2">{t.issuingAuthorityName}</p>
              <p className="text-sm text-gray-600">{t.issuingAuthority}</p>
          </div>
          <div className="text-center">
              <p className="font-bold text-lg border-t-2 border-gray-400 pt-2">{lang === 'hi' ? formatDateHindi(data.date) : formattedDate}</p>
              <p className="text-sm text-gray-600">{t.dateOfIssue}</p>
          </div>
      </footer>
    </div>
  );
};


export function Certificate({ data }: CertificateProps) {
  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background: #fff !important;
            font-family: 'Poppins', sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #certificate-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            background: transparent !important;
          }
          .no-print {
            display: none !important;
          }

          /* Hide one of the certificates depending on the print mode */
          body.print-mode-en .cert-hi { display: none !important; }
          body.print-mode-hi .cert-en { display: none !important; }
          
          /* Add a page break after the first certificate when printing both */
          body.print-mode-all .cert-en {
            page-break-after: always !important;
          }

          .cert-page {
            width: 210mm;
            height: 297mm;
            box-sizing: border-box !important;
            margin: 0 auto !important;
            padding: 1.25rem !important;
            box-shadow: none !important;
            border-width: 12px !important;
            border-color: #F59E0B !important; /* amber-400 */
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-start !important;
            page-break-inside: avoid !important;
          }
          
          /* --- Font size and spacing adjustments for print --- */
          .cert-page header,
          .cert-page footer.cert-footer-section {
            flex-shrink: 0;
          }
          .cert-page main.cert-content-section {
            flex-grow: 1;
          }
          
          .cert-page header img {
              width: 48px !important;
              height: 48px !important;
          }
          .cert-page header .text-lg,
          .cert-page header .text-base {
            font-size: 0.9rem !important;
            line-height: 1.2 !important;
          }
          .cert-page header .text-sm {
            font-size: 0.75rem !important;
            line-height: 1.2 !important;
          }
          
          .cert-page .cert-title-section {
              margin-top: 1rem !important;
              margin-bottom: 1rem !important;
          }
          
          .cert-page .cert-title-section h1 { /* Certificate Title */
              font-size: 2rem !important;
          }
          .cert-page .cert-title-section h2 { /* Person's Name */
              font-size: 1.6rem !important;
          }
          .cert-page .cert-title-section p { /* Presented to... */
              font-size: 0.9rem !important;
          }
          
          .cert-page main {
              font-size: 0.9rem !important;
              line-height: 1.4 !important;
          }

          .cert-page main h3 { /* Detailed Results */
              font-size: 1.3rem !important;
              margin-bottom: 0.75rem !important;
          }

          .cert-page main .font-semibold { /* Trait name */
            font-size: 1rem !important;
          }
          
          .cert-page main blockquote {
              font-size: 0.85rem !important;
              padding-left: 1rem !important;
              margin-top: 0.25rem !important;
          }
          
          .cert-page .space-y-3 > * + * {
            margin-top: 0.75rem !important; /* Spacing between traits */
          }

          .cert-page .cert-footer-section {
            margin-top: auto !important; /* Pushes footer to the bottom */
            padding-top: 1rem !important;
            font-size: 0.8rem !important;
          }
          .cert-page .cert-footer-section p {
            font-size: inherit !important;
          }
        }
      `}</style>
      <CertificateContent data={data} lang="en" />
      <CertificateContent data={data} lang="hi" />
    </>
  );
}

