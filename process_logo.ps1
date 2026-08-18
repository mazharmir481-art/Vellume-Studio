param(
    [string]$imagePath = "images\logo.png",
    [string]$outputPath = "images\logo_transparent.png"
)

Add-Type -AssemblyName System.Drawing

try {
    $bmp = [System.Drawing.Image]::FromFile((Resolve-Path $imagePath).Path)
    $newBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height)
    
    # Get the background color from the top-left pixel
    $bgColor = $bmp.GetPixel(0, 0)
    $bgBrightness = $bgColor.GetBrightness()

    for ($y = 0; $y -lt $bmp.Height; $y++) {
        for ($x = 0; $x -lt $bmp.Width; $x++) {
            $pixel = $bmp.GetPixel($x, $y)
            
            # Convert to grayscale brightness
            $brightness = $pixel.GetBrightness()
            
            # If the pixel is close to or lighter than the background, make it transparent
            if ($brightness -ge ($bgBrightness - 0.05)) {
                $newBmp.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
            } else {
                # Map darkness to alpha (darker = more opaque white)
                # Max opacity at brightness 0 (black), 0 opacity at bgBrightness
                $alphaRange = $bgBrightness
                if ($alphaRange -eq 0) { $alphaRange = 1 }
                
                $opacity = 1 - ($brightness / $alphaRange)
                if ($opacity -lt 0) { $opacity = 0 }
                if ($opacity -gt 1) { $opacity = 1 }
                
                $alpha = [math]::Round($opacity * 255)
                
                # Make the pixel pure white with calculated alpha
                $newColor = [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255)
                $newBmp.SetPixel($x, $y, $newColor)
            }
        }
    }
    
    $newBmp.Save((Resolve-Path -Path ".").Path + "\" + $outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    $newBmp.Dispose()
    Write-Host "Logo processed successfully to $outputPath"
} catch {
    Write-Error "Failed to process image: $_"
}
