import axios from "axios";
import type {
  User,
  Image,
  Label,
  ImageLabel,
  PingResponse,
  InitializeResponse,
  UploadResponse,
  DeleteResponse,
  UsersResponse,
  ImagesResponse,
  ImageLabelsResponse,
  LabelSearchResponse,
} from "./types";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function initialize(
  configFile: string,
  s3Profile: string,
  mysqlUser: string
): Promise<InitializeResponse> {
  const { data } = await api.post<InitializeResponse>("/initialize", {
    config_file: configFile,
    s3_profile: s3Profile,
    mysql_user: mysqlUser,
  });
  return data;
}

export async function ping(): Promise<PingResponse> {
  const { data } = await api.get<PingResponse>("/ping");
  return data;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<UsersResponse>("/users");
  return data.users;
}

export async function getImages(userid?: number): Promise<Image[]> {
  const { data } = await api.get<ImagesResponse>("/images", {
    params: userid ? { userid } : {},
  });
  return data.images;
}

export async function uploadImage(
  userid: number,
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<UploadResponse>(
    `/images/${userid}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

export async function downloadImage(assetid: number): Promise<Blob> {
  const { data } = await api.get<Blob>(`/images/${assetid}/download`, {
    responseType: "blob",
  });
  return data;
}

export async function deleteAllImages(): Promise<DeleteResponse> {
  const { data } = await api.delete<DeleteResponse>("/images");
  return data;
}

export async function getImageLabels(assetid: number): Promise<Label[]> {
  const { data } = await api.get<ImageLabelsResponse>(
    `/images/${assetid}/labels`
  );
  return data.labels;
}

export async function searchImagesByLabel(
  label: string
): Promise<ImageLabel[]> {
  const { data } = await api.get<LabelSearchResponse>(`/labels/${label}`);
  return data.images;
}
