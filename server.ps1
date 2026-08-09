# Zero-dependency PowerShell HTTP Server for local preview
$port = 8095
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")

try {
    $listener.Start()
    Write-Host "Vellume Studio preview server active at http://localhost:$port/" -ForegroundColor Green
    $folder = Get-Location

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $fileStream = $null

        try {
            $relPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = "index.html" }
            $filePath = Join-Path $folder $relPath

            if (Test-Path $filePath -PathType Leaf) {
                $response.Headers.Add("Access-Control-Allow-Origin", "*")
                $response.Headers.Add("Accept-Ranges", "bytes")

                if ($filePath.EndsWith(".html")) { $response.ContentType = "text/html; charset=utf-8" }
                elseif ($filePath.EndsWith(".css")) { $response.ContentType = "text/css; charset=utf-8" }
                elseif ($filePath.EndsWith(".js")) { $response.ContentType = "text/javascript; charset=utf-8" }
                elseif ($filePath.EndsWith(".jpeg") -or $filePath.EndsWith(".jpg")) { $response.ContentType = "image/jpeg" }
                elseif ($filePath.EndsWith(".png")) { $response.ContentType = "image/png" }
                elseif ($filePath.EndsWith(".webp")) { $response.ContentType = "image/webp" }
                elseif ($filePath.EndsWith(".svg")) { $response.ContentType = "image/svg+xml" }
                elseif ($filePath.EndsWith(".mp4")) { $response.ContentType = "video/mp4" }

                $fileStream = [System.IO.File]::OpenRead($filePath)
                $response.ContentLength64 = $fileStream.Length

                $buffer = New-Object byte[] 65536
                while (($bytesRead = $fileStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
                    $response.OutputStream.Write($buffer, 0, $bytesRead)
                }
            } else {
                $response.StatusCode = 404
                $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
            }
        } catch {
            # Catch client disconnects/aborts gracefully
        } finally {
            if ($fileStream) { $fileStream.Close(); $fileStream.Dispose() }
            try { $response.Close() } catch {}
        }
    }
} catch {
    Write-Host "Error starting server: $_" -ForegroundColor Red
} finally {
    if ($listener) { $listener.Stop() }
}
