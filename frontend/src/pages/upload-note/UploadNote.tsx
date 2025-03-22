import React, { useState, useEffect, useRef } from "react";
import Quill, { QuillOptions } from "quill";
import "quill/dist/quill.snow.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import ThumbnailPopup from "./ThumbnailPopup";
import "../../public/css/upload-note.css";
import "mathlive";
import { Settings } from "../../../settings";

const API_SERVER_URL = Settings.API_SERVER_URL
const ReactSwal = withReactContent(Swal);

interface MathfieldElement extends HTMLElement {
  value: string;
  getValue: () => string;
  setValue: (value: string) => void;
  textContent: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "math-field": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          ref?: React.Ref<MathfieldElement>;
          value?: string;
          placeholder?: string;
          "virtual-keyboard-mode"?: string;
        },
        HTMLElement
      >;
    }
  }
}

const toolbarOptions = [
  ["bold", "italic", "underline"],
  ["code-block"],
  ["link"],
  [{ script: "sub" }, { script: "super" }],
];

const UploadNote: React.FC = () => {
  const [noteSubject, setNoteSubject] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState<string>("");
  const [stackFiles, setStackFiles] = useState<File[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState<boolean>(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const mathFieldRef = useRef<MathfieldElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";
    script.async = true;
    document.body.appendChild(script);

    (window as any).MathJax = {
      tex: {
        inlineMath: [
          ["$", "$"],
          ["\\(", "\\)"],
        ],
      },
      startup: {
        ready: () => {
          (window as any).MathJax.startup.defaultReady();
          (window as any).MathJax.typesetPromise();
        },
      },
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: "snow",
        placeholder:
          "Describe your note's key insights, unique takeaways, or how it aids learning.",
        modules: {
          toolbar: toolbarOptions,
        },
      } as QuillOptions);

      const BlockEmbed = Quill.import("blots/block/embed") as unknown as {
        new(...args: any[]): {
          domNode: HTMLElement;
        };
        create(value: string): HTMLElement;
        value(node: HTMLElement): string;
        scope?: number;
      };
      class MathBlot extends BlockEmbed {
        static blotName = "math";
        static tagName = "div";
        static scope = (Quill.import('blots/block/embed') as any).scope;

        static create(value: string) {
          const node = super.create(value);
          node.setAttribute("data-latex", value);
          node.innerHTML = `\\(${value}\\)`;
          setTimeout(() => {
            if ((window as any).MathJax) {
              (window as any).MathJax.typesetPromise([node]);
            }
          }, 0);
          return node;
        }
        static value(node: HTMLElement) {
          return node.getAttribute("data-latex") || "";
        }
      }
      Quill.register('formats/math', MathBlot);

      if (editorRef.current) {
        editorRef.current.style.height = "250px";
      }
    }

    if (mathFieldRef.current) {
      mathFieldRef.current.setValue("");
      mathFieldRef.current.setAttribute("virtual-keyboard-mode", "manual");
      mathFieldRef.current.setAttribute("placeholder", "Enter math here (e.g., x^2 + 3)");
    }

    return () => {
      quillRef.current = null;
      mathFieldRef.current = null;
    };
  }, []);

  const handleInsertMath = () => {
    if (mathFieldRef.current && quillRef.current) {
      const latex = mathFieldRef.current.getValue();
      if (latex) {
        const range = quillRef.current.getSelection(true);
        const index = range ? range.index : quillRef.current.getLength();
        quillRef.current.insertEmbed(index, "math", latex, "user");
        mathFieldRef.current.setValue("");
      } else {
        ReactSwal.fire({
          icon: "warning",
          title: "No Math Content",
          text: "Please enter a mathematical expression before inserting.",
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validTypes = ["image/png", "image/jpeg"];

    const validFiles = files.filter((file) => {
      if (!validTypes.includes(file.type)) {
        ReactSwal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: `${file.name} is not a supported format (PNG or JPG only).`,
        });
        return false;
      }

      if (file.size > 10 * 1024 * 1024) {
        ReactSwal.fire({
          icon: "error",
          title: "File Too Large",
          text: `${file.name} exceeds the 10MB limit.`,
        });
        return false;
      }

      return true;
    });

    setStackFiles((prev) => [...prev, ...validFiles]);

    if (validFiles.length > 0) showUploadEffect();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateStackStatus = (): string => {
    const count = stackFiles.length;
    return count === 0
      ? "No Images"
      : count === 1
        ? "1 Image"
        : `${count} Images`;
  };

  const showUploadEffect = () => {
    setShowUploadSuccess(true);
    setTimeout(() => {
      setShowUploadSuccess(false);
    }, 2400);
  };

  const handlePublish = async () => {
    const descriptionText = quillRef.current?.getText().trim() || "";
    const noteDescription = quillRef.current?.root.innerHTML || "";

    if (!noteSubject || !noteTitle || !descriptionText) {
      ReactSwal.fire({
        icon: "error",
        title: "Incomplete Form",
        text: "Please share all the details before publishing",
      });
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    stackFiles.forEach((file, index) =>
      formData.append(`image-${index}`, file)
    );
    formData.append("postSubject", noteSubject);
    formData.append("postTitle", noteTitle);
    formData.append("postDescription", noteDescription);

    try {
      ReactSwal.fire({
        icon: "success",
        title: "Processing...",
        text: "Your post is being processed to upload"
      })

      const response = await fetch(`${API_SERVER_URL}/api/upload`, {
        method: "post",
        credentials: "include",
        body: formData
      })
      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          setStackFiles([]);
          setIsPopupOpen(false);

          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
          (document.querySelector(".note-subject") as HTMLSelectElement).value = "";
          (document.querySelector(".note-title") as HTMLInputElement).value = "";
          if (quillRef.current) {
            quillRef.current.root.innerHTML = "";
          }

          ReactSwal.fire({
            icon: "success",
            title: "You're good to go!",
            text: "Your post has been uploaded successfully!"
          })
        } else {
          ReactSwal.fire({
            icon: "error",
            title: "Upload failure",
            text: data.message || "Something went wrong! Please try again a bit later"
          })
        }
      } else {
        ReactSwal.fire({
          icon: "error",
          title: "Upload failure",
          text: "Something went wrong! Please try again a bit later"
        })
      }

    } catch (error) {
      ReactSwal.fire({
        icon: "error",
        title: "Connection Error",
        text: "Please check your internet connection and try again."
      })
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className="middle-section-upload">
      <header className="section-header">
        <h2>Upload New Post</h2>
        <p className="header-subtitle">
          Upload images if you want, or skip them. Just share the details, and you're good to go!"
        </p>
      </header>

      <div className="upload-container">
        <div className="upload-icon">
          <svg
            width="60"
            height="60"
            viewBox="0 0 73 73"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_606_961)">
              <path
                d="M48.3085 48.3057L36.2314 36.2286M36.2314 36.2286L24.1542 48.3057M36.2314 36.2286V63.4021M61.5631 55.5218C64.5079 53.9164 66.8343 51.376 68.175 48.3016C69.5156 45.2272 69.7943 41.7938 68.967 38.5435C68.1397 35.2931 66.2535 32.4108 63.6062 30.3514C60.9588 28.2921 57.7011 27.173 54.347 27.1708H50.5427C49.6289 23.6359 47.9255 20.3542 45.5608 17.5724C43.196 14.7907 40.2314 12.5811 36.8899 11.11C33.5483 9.6389 29.9167 8.94445 26.2681 9.07888C22.6195 9.21331 19.0488 10.1731 15.8246 11.8862C12.6003 13.5992 9.80635 16.0209 7.65273 18.9691C5.49911 21.9174 4.04188 25.3155 3.39059 28.908C2.7393 32.5006 2.9109 36.194 3.89249 39.7106C4.87409 43.2273 6.64013 46.4756 9.05784 49.2115"
                stroke="#1E1E1E"
                strokeWidth="6.03856"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_606_961">
                <rect width="72.4627" height="72.4627" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <p className="upload-msg">Upload Images</p>
        <p className="suggested-formats-msg">
          Supported: PNG, JPG (Max 10MB each)
        </p>
        <div className="browse-file-container">
          <input
            type="file"
            id="fileInput"
            className="file-input"
            name="images"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
          />
          <label htmlFor="fileInput" className="browse-files-btn">
            Select Files
          </label>
        </div>
      </div>

      <div className="stack-status">
        <div
          className="stack-number-container"
          onClick={() => setIsPopupOpen(true)}
          style={{
            backgroundColor:
              stackFiles.length >= 1 && stackFiles.length <= 5
                ? "#DEEDFF"
                : stackFiles.length >= 6
                  ? "#F2F8F0"
                  : "#F8F8F8",
            borderColor:
              stackFiles.length >= 1 && stackFiles.length <= 5
                ? "#2D61D8"
                : stackFiles.length >= 6
                  ? "#529F3D"
                  : "#E0E0E0",
          }}
        >
          <div className="snc-info-wrapper">
            <span className="stack-info">
              <span className="stack-number">{updateStackStatus()}</span>
            </span>
          </div>
          <span className="stack-prompt">View Stack</span>
        </div>
        <div className={`success-upload-msg ${showUploadSuccess ? 's-u-effect' : ''}`}
          style={{ display: showUploadSuccess ? "flex" : "none" }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_1844_2149)">
              <path
                d="M14.0001 0C6.28041 0 0 6.28031 0 13.9999C0 21.7195 6.28041 27.9998 14.0001 27.9998C21.7197 27.9998 28 21.7195 28 13.9999C28 6.28031 21.7197 0 14.0001 0ZM14.0001 25.7047C7.5459 25.7047 2.29507 20.4541 2.29507 13.9999C2.29507 7.54581 7.5459 2.29507 14.0001 2.29507C20.4542 2.29507 25.7049 7.54581 25.7049 13.9999C25.7049 20.4541 20.4542 25.7047 14.0001 25.7047Z"
                fill="#1D8102"
              />
              <path
                d="M20.0564 8.62512L11.744 16.9376L7.94357 13.1371C7.49539 12.689 6.76887 12.689 6.32069 13.1371C5.8726 13.5853 5.8726 14.3118 6.32069 14.76L10.9326 19.3719C11.1567 19.5959 11.4503 19.708 11.744 19.708C12.0377 19.708 12.3314 19.708 12.5555 19.3719L21.6793 10.2481C22.1274 9.79992 22.1274 9.07339 21.6793 8.62521C21.2311 8.17703 20.5045 8.17703 20.0564 8.62512Z"
                fill="#1D8102"
              />
            </g>
            <defs>
              <clipPath id="clip0_1844_2149">
                <rect width="28" height="28" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span>Files Added Successfully</span>
        </div>
      </div>

      <div className="text-form">
        <div className="form-group">
          <label htmlFor="noteSubject">Subject</label>
          <select
            name="noteSubject"
            id="noteSubject"
            className="note-subject"
            value={noteSubject}
            onChange={(e) => setNoteSubject(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a Subject
            </option>
            {[
              "Bangla",
              "English",
              "ICT",
              "Physics 1st Paper",
              "Physics 2nd Paper",
              "Chemistry 1st Paper",
              "Chemistry 2nd Paper",
              "Biology 1st Paper",
              "Biology 2nd Paper",
              "Higher Mathematics 1st Paper",
              "Higher Mathematics 2nd Paper",
              "Statistics",
              "History",
              "Geography",
              "Logic",
              "Philosophy",
              "Political Science",
              "Sociology",
              "Economics",
              "Islamic History & Culture",
              "Social Work",
              "Psychology",
              "Islamic Studies",
            ].map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="noteTitle">Title</label>
          <input
            type="text"
            id="noteTitle"
            className="note-title"
            placeholder="Enter a concise title (max 200 characters)"
            name="noteTitle"
            maxLength={200}
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <div className="text-editor-wrapper">
            <div ref={editorRef} />
            <div className="math-editor-container">
              <label style={{ marginTop: "10px", display: "block" }}>
                Add Mathematical Expressions:
              </label>
              <div className="math-editor-wrapper">
                {React.createElement('math-field', {
                  ref: mathFieldRef,
                  placeholder: "Enter math here (e.g., x^2 + 3)",
                })}
                <button
                  className="insert-math-btn"
                  onClick={handleInsertMath}
                  title="Insert Math"
                  aria-label="Insert Math"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="12" fill="var(--squid-ink)" />
                    <path
                      d="M12 7V17M7 12H17"
                      stroke="var(--neon-blue)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          className="publish-note-btn"
          onClick={handlePublish}
          disabled={isLoading}
        >
          {isLoading ? "Publishing..." : "Publish Post"}
        </button>
      </div>

      <div
        className="overlay"
        style={{ display: isPopupOpen ? "block" : "none" }}
      />
      <ThumbnailPopup
        isOpen={isPopupOpen}
        stackFiles={stackFiles}
        setStackFiles={setStackFiles}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
};

export default UploadNote;