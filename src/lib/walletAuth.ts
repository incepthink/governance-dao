import { axiosInstance } from "@/lib/utils";

export async function walletAuthenticate(
  address: string,
  signMessageAsync: (args: {
    account: `0x${string}`;
    message: string;
  }) => Promise<`0x${string}`>
): Promise<any> {
  let message: string;
  let authToken: string;

  try {
    const { data } = await axiosInstance.get(
      `/auth/wallet/request-token/${address}`
    );
    message = data.message;
    authToken = data.token;
  } catch (err: any) {
    if (err.response?.status === 400) {
      // Wallet already authenticated — response body is user_instance
      return err.response.data;
    }
    throw err;
  }

  const signature = await signMessageAsync({
    account: address as `0x${string}`,
    message,
  });

  const { data: loginData } = await axiosInstance.post("/auth/wallet/login", {
    signature,
    address,
    token: authToken,
  });

  return loginData.user_instance;
}
