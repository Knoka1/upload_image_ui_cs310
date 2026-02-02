export interface User {
  userid: number;
  username: string;
  givenname: string;
  familyname: string;
}

export interface Image {
  assetid: number;
  userid: number;
  localname: string;
  bucketkey: string;
}

export interface Label {
  label: string;
  confidence: number;
}

export interface ImageLabel {
  assetid: number;
  label: string;
  confidence: number;
}

export interface PingResponse {
  bucket_items: number | string;
  user_count: number | string;
}

export interface InitializeResponse {
  success: boolean;
  message: string;
}

export interface UploadResponse {
  assetid: number;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export interface UsersResponse {
  users: User[];
}

export interface ImagesResponse {
  images: Image[];
}

export interface ImageLabelsResponse {
  assetid: number;
  labels: Label[];
}

export interface LabelSearchResponse {
  label: string;
  images: ImageLabel[];
}
