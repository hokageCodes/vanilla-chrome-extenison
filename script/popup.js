document.addEventListener("DOMContentLoaded", () => {
    const startVideoButton = document.querySelector("button#start_video");
    const stopVideoButton = document.querySelector("button#stop_video");
  
    startVideoButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "request_recording" }, function (response) {
        if (!chrome.runtime.lastError) {
          console.log(response);
        } else {
          console.log(chrome.runtime.lastError, 'error line 14');
        }
      });
    });
  
    stopVideoButton.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "stopvideo" }, function (response) {
        if (!chrome.runtime.lastError) {
          console.log(response);
        } else {
          console.log(chrome.runtime.lastError, 'error line 27');
        }
      });
    });
  });
  