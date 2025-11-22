import subprocess
import uuid
import shutil
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def convert_docx_to_pdf(docx_path: Path, pdf_path: Path | None = None) -> Path | None:
    """Convert DOCX to PDF using LibreOffice with isolated user profiles."""
    
    # Ensure paths are absolute (LibreOffice can fail with relative paths)
    docx_path = docx_path.resolve()
    
    if pdf_path is None:
        pdf_path = docx_path.with_suffix('.pdf')
    
    output_dir = pdf_path.parent.resolve()

    # Create a unique temporary directory for the user profile to prevent locking issues
    # This allows parallel execution and solves permission errors in Docker
    profile_dir = Path(f"/tmp/libreoffice_profile_{uuid.uuid4()}")
    
    try:
        # LibreOffice command
        command = [
            "libreoffice",
            "--headless",
            "--nologo",
            "--nofirststartwizard",
            # Magic flag: Tell LO to use a specific, temporary user installation directory
            f"-env:UserInstallation=file://{profile_dir}", 
            "--convert-to",
            "pdf",
            str(docx_path),
            "--outdir",
            str(output_dir)
        ]
        
        logger.info(f"Converting: {docx_path} -> PDF in {output_dir}")
        
        result = subprocess.run(
            command, 
            capture_output=True, 
            text=True, 
            timeout=120 # Increased timeout for cold starts
        )
        
        if result.returncode != 0:
            logger.error(f"LibreOffice failed. Return code: {result.returncode}")
            logger.error(f"Stderr: {result.stderr}")
            logger.error(f"Stdout: {result.stdout}")
            return None

        # Verify file creation
        # LibreOffice --outdir uses the source filename, so we check if that exists
        expected_output = output_dir / docx_path.with_suffix('.pdf').name
        
        if expected_output.exists():
            # If the user wanted a specific name different from source, rename it
            if expected_output != pdf_path:
                expected_output.rename(pdf_path)
            
            logger.info(f"PDF created successfully: {pdf_path}")
            return pdf_path
        else:
            logger.error(f"LibreOffice finished but PDF not found at: {expected_output}")
            return None

    except subprocess.TimeoutExpired:
        logger.error("LibreOffice conversion timed out.")
        return None
    except Exception as e:
        logger.error(f"Conversion error: {str(e)}")
        return None
    finally:
        # Clean up the temporary profile directory
        if profile_dir.exists():
            shutil.rmtree(profile_dir, ignore_errors=True)