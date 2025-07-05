// Azure Storage troubleshooting utilities

export function logNetworkDiagnostics() {
  console.log("=== Network Diagnostics ===");
  console.log("Current URL:", window.location.href);
  console.log("Origin:", window.location.origin);
  console.log("Protocol:", window.location.protocol);
  console.log("User Agent:", navigator.userAgent);
  console.log("Online status:", navigator.onLine);
}

export function logCORSInstructions() {
  console.log("=== CORS Configuration Required ===");
  console.log(
    "If you see CORS errors, you need to configure Azure Storage CORS settings:"
  );
  console.log(
    "1. Go to Azure Portal -> Storage Account -> Settings -> Resource sharing (CORS)"
  );
  console.log("2. Add a new CORS rule:");
  console.log("   - Allowed origins: * (or your specific domain)");
  console.log("   - Allowed methods: GET, PUT, POST, DELETE, OPTIONS");
  console.log("   - Allowed headers: *");
  console.log("   - Exposed headers: *");
  console.log("   - Max age: 3600");
  console.log("3. Save the CORS settings");
  console.log("4. Wait a few minutes for changes to propagate");
}

export async function testAzureConnectivity() {
  const accountName = "transactionsdocs";

  console.log("=== Testing Azure Connectivity ===");

  // Test 1: Basic DNS resolution and network connectivity
  try {
    console.log("Test 1: Basic connectivity (no-cors)...");
    await fetch(`https://${accountName}.blob.core.windows.net`, {
      method: "HEAD",
      mode: "no-cors",
    });
    console.log("✅ Basic connectivity: OK");
  } catch (error) {
    console.log("❌ Basic connectivity: Failed", error.message);
    return false;
  }

  // Test 2: CORS preflight
  try {
    console.log("Test 2: CORS preflight...");
    const corsResponse = await fetch(
      `https://${accountName}.blob.core.windows.net`,
      {
        method: "OPTIONS",
        headers: {
          Origin: window.location.origin,
          "Access-Control-Request-Method": "PUT",
        },
      }
    );
    console.log("✅ CORS preflight: OK", corsResponse.status);
  } catch (error) {
    console.log("❌ CORS preflight: Failed", error.message);
    logCORSInstructions();
    return false;
  }

  return true;
}
