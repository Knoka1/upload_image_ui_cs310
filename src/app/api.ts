const API_URL = "http://localhost:5000/api";

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
}

export async function getImages(userId?: string) {
  let url = `${API_URL}/images`;

  if (userId) {
    url += `?userid=${userId}`;
  }

  const res = await fetch(url);
  return res.json();
}

export async function uploadImage(file: File, userId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("user_id", userId);

  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    body: formData
  });

  return res.json();
}

export async function getLabels(imageId: string) {
  const res = await fetch(`${API_URL}/labels/${imageId}`);
  return res.json();
}

export async function searchImages(label: string) {
  const res = await fetch(`${API_URL}/search?label=${label}`);
  return res.json();
}

export async function downloadImage(imageId: string) {
  window.open(`${API_URL}/download/${imageId}`);
}

export async function deleteImages() {
  const res = await fetch(`${API_URL}/images`, {
    method: "DELETE",
  });

  return res.json();
}