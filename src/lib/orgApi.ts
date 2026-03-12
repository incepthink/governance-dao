import { axiosOwner, axiosInstance } from "./utils";

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await axiosOwner.post<{
    success: boolean;
    imageUrl: string;
  }>("/owner/upload/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.imageUrl;
}

export async function createOrganisation(payload: {
  collection: {
    name: string;
    description?: string;
    image_uri?: string;
    banner_image?: string;
  };
  contract: { address: string };
}) {
  const { data } = await axiosOwner.post(
    "/owner/dao/organisation/create",
    payload,
  );
  return data.organisation;
}

interface OrgApiOrganisation {
  id: number;
  name: string;
  description: string;
  image_uri: string;
  banner_image: string;
  contract: { contract_address: string } | null;
}

export async function getOwnerOrganisation(): Promise<OrgApiOrganisation | null> {
  const { data } = await axiosOwner.get<{ organisation: OrgApiOrganisation }>(
    "/owner/dao/organisation",
  );
  return data.organisation ?? null;
}

interface PlatformOrgItem {
  id: number;
  name: string;
  description: string;
  image_uri: string;
  token: { contract_address: string } | null;
  proposals: number;
  members: number;
  active_proposals: number;
}

interface PlatformOrgResponse {
  summary: {
    total_orgs: number;
    active_proposals: number;
    total_votes_cast: number;
  };
  organisations: PlatformOrgItem[];
}

export async function getOrganisation(): Promise<{ org: PlatformOrgItem; summary: PlatformOrgResponse["summary"] } | null> {
  const { data } = await axiosInstance.get<PlatformOrgResponse>(
    "/platform/dao/organisation",
  );
  if (!data.organisations?.length) return null;
  return { org: data.organisations[0], summary: data.summary };
}

export async function createProposal(payload: {
  proposal: {
    collection_id: number;
    title: string;
    description: string;
    start_date: string;
    end_date: string;
    min_token_threshold: number;
    participation_logic: "AND" | "OR";
    min_participants: number;
    yes_no_ratio: number;
  };
  participation_logic: {
    type: "loyalty" | "badge" | "nft" | "quest";
    loyalty_min?: number | null;
  };
}) {
  const { data } = await axiosOwner.post("/owner/dao/proposal", payload);
  return data;
}
