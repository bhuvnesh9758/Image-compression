import React, { useState } from "react";
// import Compressor from "compressorjs";
import imageCompression from "browser-image-compression";

const Upload = () => {
  const [compressedFile, setCompressedFile] = useState(null);
  const [sourceFile, setSourceFile] = useState(null);
  const [inputFileSrc, setInputFileSrc] = useState(null);
  const [compressedImageSrc, setCompressedImageSrc] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageUpload = async (event) => {
    let inputImageWidth, inputImageHeight;
    let imageFile = event.target.files[0];
    setIsCompressing(true);
    if (!imageFile) return;
    setSourceFile(imageFile);
    const imageFileSize = imageFile.size / 1024 / 1024;
    //getting image dimensions
    const imagesrcFile = await readAsDataURL(imageFile);
    const img = new Image();
    img.onload = (val) => {
      inputImageWidth = val?.path[0]?.naturalWidth;
      inputImageHeight = val?.path[0]?.naturalHeight;
      console.log(inputImageWidth, inputImageHeight);
    };
    img.src = imagesrcFile;
    setInputFileSrc(imagesrcFile);
    console.log("originalFile instanceof Blob", imageFile instanceof Blob); // true
    console.log(`originalFile size ${imageFileSize} MB`);
    if (inputImageWidth * inputImageHeight < 1920 * 1080 || imageFileSize < 1) {
      alert("image is already of low quality, thus can't be compressed.");
      //   return;
    }
    var options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };
    // const dataURL =await imageCompression.getDataUrlFromFile(imageFile)
    // console.log(dataURL)
    imageCompression(imageFile, options)
      .then(async (compressedFile) => {
        console.log(
          "compressedFile instance of Blob",
          compressedFile instanceof Blob
        ); // true
        console.log(
          `compressedFile size ${compressedFile.size / 1024 / 1024} MB`
        );
        const imagesrcFile = await readAsDataURL(compressedFile);
        setCompressedImageSrc(imagesrcFile);
        // smaller than maxSizeMB
        setCompressedFile(compressedFile);
        // return uploadToServer(compressedFile); // write your own logic
        setIsCompressing(false);
      })
      .catch(function (error) {
        console.log(error);
        setIsCompressing(false);
      });
  };
  function readAsDataURL(inputFile) {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onerror = () => {
        fileReader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
      fileReader.onloadend = () => {
        resolve(fileReader.result);
      };
      fileReader.readAsDataURL(inputFile);
    });
  }

  //   const handleCompressedUpload = (e) => {
  //     const image = e.target.files[0];
  //     imageFile = image;
  //     console.log(image.size);
  //     new Compressor(image, {
  //       quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
  //       success: async (compressedResult) => {
  //         console.log(compressedResult instanceof File);
  //         // compressedResult has the compressed file.
  //         // Use the compressed file to upload the images to your server.
  //         setCompressedFile(compressedResult);
  //         console.log(
  //           `compressedFile size ${compressedResult.size / 1024 / 1024} MB`
  //         );
  //         const imagesrcFile = await readAsDataURL(compressedResult);
  //         setImageSrc(imagesrcFile);
  //       },
  //       maxHeight: 1080,
  //       maxWidth: 1920,
  //       height: 1080,
  //       width: 1920,
  //     });
  //   };
  function downloadBlob(blob, name = "file.txt") {
    // Convert your blob into a Blob URL (a special url that points to an object in the browser's memory)
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement("a");

    // Set link's href to point to the Blob URL
    link.href = blobUrl;
    // link.download = name;
    link.download = name;

    // Append link to the body
    document.body.appendChild(link);

    // Dispatch click event on the link
    // This is necessary as link.click() does not work on the latest firefox
    link.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      })
    );
    // link.click();

    // Remove link from body
    document.body.removeChild(link);
  }

  //   const jsonBlob = new Blob(['{"name": "test"}']);
  const getSize = (id) => {
    const image = document.getElementById(id);
    return { width: image.clientWidth, height: image.clientHeight };
  };

  const compressedFileName =
    sourceFile &&
    `${sourceFile.name.split(".").slice(0, -1).join(".")}_compressed.${
      sourceFile.type === "image/heif"
        ? "png"
        : sourceFile.name.split(".").slice(-1).join(".")
    }`;

  return (
    <div>
      <div
        style={{
          margin: "10px auto",
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <input
          //   accept="image/*"
          type="file"
          onChange={(event) => handleImageUpload(event)}
        />
        {isCompressing && (
          <React.Fragment>
            <div>Image is being compressed,wait...</div>
            <div class="spinner-border text-primary" role="status"></div>
          </React.Fragment>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          //   flexDirection: "column",
          gap: "16px",
          margin: 16,
        }}
      >
        {sourceFile && (
          <div class="card" style={{ width: "24rem" }}>
            <img src={inputFileSrc} class="card-img-top" alt="source file" />
            <div class="card-body">
              <h5 class="card-title">Original Image</h5>
              <div style={{ display: "flex", marginBottom: 16 }}>
                <div style={{ width: "50%" }}>
                  <h6 appearance="subtle">Size</h6>
                </div>
                <p>{`${(sourceFile.size / 1024 / 1024).toFixed(2)} MB`}</p>
              </div>
              <div style={{ display: "flex", marginBottom: 16 }}>
                <div style={{ width: "50%" }}>
                  <h6 appearance="subtle">Type</h6>
                </div>
                <p>{sourceFile.type}</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => downloadBlob(sourceFile, sourceFile?.name)}
              >
                Download
              </button>
            </div>
          </div>
        )}
        {compressedFile && sourceFile && (
          <div class="card" style={{ width: "24rem" }}>
            <img
              src={compressedImageSrc}
              class="card-img-top"
              alt="source file"
            />
            <div class="card-body">
              <h5 class="card-title">Compressed Image</h5>
              <div style={{ display: "flex", marginBottom: 16 }}>
                <div style={{ width: "50%" }}>
                  <h6 appearance="subtle">Size</h6>
                </div>
                <p>{`${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`}</p>
              </div>
              <div style={{ display: "flex", marginBottom: 16 }}>
                <div style={{ width: "50%" }}>
                  <h6 appearance="subtle">Type</h6>
                </div>
                <p>{compressedFile.type}</p>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => downloadBlob(compressedFile, compressedFileName)}
              >
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
