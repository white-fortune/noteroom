import { useEffect, useState } from "react";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";


const API_SERVER_URL = import.meta.env.VITE_API_SERVER_URL

export default function RequestModal({ modalShow, recipientData }: any) {
  const MAX_MESSAGE_LENGTH = 170;
  const [reqMsg, setReqMsg] = useState("");
  const [charCounter, setCharCounter] = useState(0);
  const [isDisabled, setIsDisabled] = useState(true);

  function fireToast(title: string, icon: any) {
    return withReactContent(Swal).fire({
      toast: true,
      icon: icon,
      position: "bottom-right",
      title: title,
      showConfirmButton: true,
      timer: 3000,
      timerProgressBar: true
    })
  }
  async function sendRequest() {
    try {
      const requestForm = new FormData()
      requestForm.append("receiverUsername", recipientData.username)
      requestForm.append("message", reqMsg)

      const response = await fetch(`${API_SERVER_URL}/api/requests/send`, {
        method: "post",
        credentials: "include",
        body: requestForm
      })
      if (response.ok) {
        const data = await response.json()
        if (data.ok) {
          fireToast('Request sent successfully!', 'success')
          modalShow[1](false)
        } else {
          fireToast(data.message || "Something went wrong! Please try again a bit later", 'error')
        }
      } else {
        fireToast("Something went wrong! Please try again a bit later", 'error')
      }
    } catch (error) {
      fireToast("Something went wrong! Please try again a bit later", 'error')
      console.error(error)
    }
  }

  function writeRequest(e: any) {
    setReqMsg(e.target.value);
    let charLength = e.target.value.length;
    setCharCounter(
      charLength <= MAX_MESSAGE_LENGTH ? charLength : MAX_MESSAGE_LENGTH + 1
    );
  }

  useEffect(() => {
    setIsDisabled(charCounter === 0 || charCounter === MAX_MESSAGE_LENGTH + 1);
  }, [charCounter]);

  return (
    <div
      className="request-modal-overlay"
      style={{ display: modalShow[0] ? "flex" : "none" }}
    >
      <div className="request-modal">
        <div className="request-modal__fr">
          <div className="modal-header">
            <span
              className="close-share-note-modal"
              onClick={() => modalShow[1](false)}
            >
              &times;
            </span>
          </div>
          <span className="request-modal__fr--requested-label">To:</span>
          <img
            src={recipientData.profile_pic}
            alt="UserName"
            className="request-modal__fr-requested-userpic"
            id="request-rec-pfp"
          />
          <span
            className="request-modal__fr--requested-username"
            id="request-rec-dn"
          >
            {recipientData.displayname}
          </span>
        </div>
        <div className="request-modal__sr">
          <textarea
            name="Request Description"
            placeholder="Briefly describe what you need"
            className="request-modal__sr--input"
            onChange={(e) => writeRequest(e)}
            value={reqMsg}
          ></textarea>
          <span className="request-modal__sr--char-count">
            {charCounter <= MAX_MESSAGE_LENGTH
              ? charCounter
              : MAX_MESSAGE_LENGTH}
            /{MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <div className="request-modal__tr">
          <button
            className="request-modal__tr--send-req-btn"
            disabled={isDisabled}
            onClick={() => !isDisabled && sendRequest()}
          >
            Request
          </button>
        </div>
      </div>
    </div>
  );
}
