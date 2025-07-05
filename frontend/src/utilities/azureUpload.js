// Simple Azure Blob Storage upload utility
export async function uploadFileToAzure(fileName, file) {
  if (!file) {
    return {
      error: "No file selected",
      success: false,
    };
  }

  // Azure Storage configuration
  const accountName = import.meta.env.VITE_AZURE_ACCOUNT_NAME;
  const containerName = import.meta.env.VITE_AZURE_CONTAINER_NAME;
  const sasToken = import.meta.env.VITE_AZURE_SAS_TOKEN;

  // Validate environment variables
  if (!accountName || !containerName || !sasToken) {
    return {
      error:
        "Azure Storage configuration missing. Please check environment variables (VITE_AZURE_ACCOUNT_NAME, VITE_AZURE_CONTAINER_NAME, VITE_AZURE_SAS_TOKEN).",
      success: false,
    };
  }

  // Validate SAS token format
  if (!sasToken.includes("sig=")) {
    return {
      error:
        "Invalid Azure SAS token format. Please check VITE_AZURE_SAS_TOKEN.",
      success: false,
    };
  }

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
