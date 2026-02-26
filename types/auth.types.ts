export type SignupRequest = {
    email: string;
    password: string;
    re_password: string;
    first_name: string;
    last_name: string;
    phone: string;
    country: string;
    date_of_birth: string;
    agree_to_terms: boolean;
};

export type SignupResponse = Record<string, unknown>;

export type LoginRequest = {
    email: string;
    password: string;
};

export type LoginResponse = {
    refresh: string;
    access: string;
};

export type LoginCredentials = LoginRequest;
export type SignupData = SignupRequest;

export type VerifySignupCodeRequest = {
    email: string;
    code: string;
};

export type VerifySignupCodeResponse = Record<string, unknown>;

export type ResendVerificationCodeRequest = {
    email: string;
};

export type ResendVerificationCodeResponse = Record<string, unknown>;
