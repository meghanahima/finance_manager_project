// Simple Azure Blob Storage upload utility
export async function uploadFileToAzure(fileName, file) {
  if (!file) {
    return {
      error: "No file selected",
      success: false,
    };
  }

  // Azure Storage configuration
  const accountName = "transactionsdocs";
  const containerName = "receiptdocs";
  const sasToken =
    "sp=racwd&st=2025-07-05T06:17:26Z&se=2026-07-05T14:17:26Z&sv=2024-11-04&sr=c&sig=dpYeQ8Iu40Rw7znqOfUqC%2Bxu6DvjBjtJ6ceiOv0NMQc%3D";

  const uploadUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type,
      },
      body: file,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `Upload failed: ${response.status} ${response.statusText} - ${errorText}`,
        data: {
          status: response.status,
          statusText: response.statusText,
          errorText,
        },
        success: false,
      };
    }

    const fileUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}`;

    return {
      url: fileUrl,
      data: { status: response.status },
      success: true,
    };
  } catch (error) {
    let errorMessage = "Upload failed: ";
    if (error.name === "AbortError") {
      errorMessage += "Request timed out after 30 seconds";
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage += "Network error - unable to connect to Azure Storage";
    } else if (error.message.includes("CORS")) {
      errorMessage +=
        "CORS policy error - Azure Storage CORS not configured for this domain";
    } else {
      errorMessage += error.message;
    }

    return {
      error: errorMessage,
      data: {
        name: error.name,
        message: error.message,
        cause: error.cause,
        currentOrigin: window.location.origin,
      },
      success: false,
    };
  }
}
