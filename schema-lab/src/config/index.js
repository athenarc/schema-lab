import {SupportedLoginsMap} from "./constants";
import configuration from "./config.json";

const readEnv = (envName, {trim = false, defaultValue = null, emptyValueIsValid = true} = {}) => {
    const envValue = process.env[envName];

    const parsedEnvValue = envValue ? (trim ? envValue.trim() : envValue) : envValue

    // The following condition basically says: if the environment variable is defined as an empty string and empty
    // strings are not a valid value, or if the environment variable is not defined at all, and for both of these cases
    // no default has been given, then throw a missing value error.
    if (((envValue !== undefined && parsedEnvValue === "" && !emptyValueIsValid) || envValue === undefined) && defaultValue === null) {
        throw new Error(`Environment variable "${envName}" is considered empty and no default can be used`)
    }

    if ((envValue === undefined) || (parsedEnvValue === "" && !emptyValueIsValid)) {
        // defaultValue will always be defined at this point because `null` defaultValue would throw the error above
        return defaultValue;
    }
    return parsedEnvValue;

}

const parseLoginProviders = supportedLoginsProvidersDescription => {
    if (!supportedLoginsProvidersDescription) return [];
    const loginProviderIdentifiers = supportedLoginsProvidersDescription.split(",").map(identifier => identifier.trim());
    const loginProviders = loginProviderIdentifiers.map(identifier => SupportedLoginsMap[identifier])
    const unknownLoginProvider = loginProviders.findIndex(loginProvider => loginProvider === undefined);
    if (unknownLoginProvider === -1) return loginProviders;
    throw new Error(`Invalid configuration [LoginProviders]: Value "${loginProviderIdentifiers[unknownLoginProvider]}" is not a known login provider`)
};

const { pagination } = configuration;

const config = {
    auth: {
        login_providers: parseLoginProviders(
            readEnv("REACT_APP_SCHEMA_LAB_LOGIN_PROVIDERS", {
                defaultValue: "ApiKeyLogin",
                trim: true,
                emptyValueIsValid: false
            })
        )
    },
    api: {
        url: readEnv("REACT_APP_SCHEMA_API_URL", {
            trim: true,
            emptyValueIsValid: false
        })
    },
    client: {
        preferences: {
            pageSize: Number.parseInt(pagination.taskPerPage)
        }
    }
};

export default config;