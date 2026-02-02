from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import photoapp
import os

app = FastAPI(title="PhotoApp API", version="1.0.0")


@app.post("/initialize")
def initialize(config_file: str, s3_profile: str, mysql_user: str):
    """Initialize the photoapp with configuration."""
    try:
        photoapp.initialize(config_file, s3_profile, mysql_user)
        return {"success": True, "message": "Initialized successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/ping")
def ping():
    """Check connection to S3 and database."""
    try:
        m, n = photoapp.get_ping()
        return {"bucket_items": m, "user_count": n}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/users")
def get_users():
    """Get all users."""
    try:
        users = photoapp.get_users()
        return {
            "users": [
                {
                    "userid": r[0],
                    "username": r[1],
                    "givenname": r[2],
                    "familyname": r[3],
                }
                for r in users
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/images")
def get_images(userid: int = None):
    """Get all images or images for a specific user."""
    try:
        images = photoapp.get_images(userid=userid)
        return {
            "images": [
                {
                    "assetid": r[0],
                    "userid": r[1],
                    "localname": r[2],
                    "bucketkey": r[3],
                }
                for r in images
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/images/{userid}")
def upload_image(userid: int, file: UploadFile = File(...)):
    """Upload an image for a user."""
    try:
        filename = file.filename
        # Save file temporarily
        with open(filename, "wb") as f:
            f.write(file.file.read())
        
        assetid = photoapp.post_image(userid, filename)
        
        # Clean up temp file
        os.remove(filename)
        
        return {"assetid": assetid, "message": "Image uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/images/{assetid}/download")
def download_image(assetid: int):
    """Download an image."""
    try:
        filename = f"download_{assetid}.jpg"
        photoapp.get_image(assetid, filename)
        return FileResponse(filename, filename=filename)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/images")
def delete_all_images():
    """Delete all images."""
    try:
        photoapp.delete_images()
        return {"success": True, "message": "All images deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/images/{assetid}/labels")
def get_image_labels(assetid: int):
    """Get labels for an image."""
    try:
        labels = photoapp.get_image_labels(assetid)
        return {
            "assetid": assetid,
            "labels": [{"label": r[0], "confidence": r[1]} for r in labels],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/labels/{label}")
def get_images_by_label(label: str):
    """Get all images with a specific label."""
    try:
        images = photoapp.get_images_with_label(label)
        return {
            "label": label,
            "images": [
                {"assetid": r[0], "label": r[1], "confidence": r[2]}
                for r in images
            ],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
