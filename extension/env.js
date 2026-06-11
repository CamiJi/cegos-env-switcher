const ALLOWED_CANONICAL_HOST_PATTERNS = [
  /(^|\.)cegos\.[a-z.]+$/i,
  /(^|\.)cegoc\.[a-z.]+$/i,
  /(^|\.)ib-formation\.[a-z.]+$/i
];

const ENV = {
  PROD: "prod",
  PREPROD: "preprod",
  LOCALHOST: "localhost",
  UNSUPPORTED: "unsupported"
};

function getCanonicalProdHostname(hostname) {
  let result = hostname;

  if (result.endsWith(".localhost")) {
    result = result.slice(0, -".localhost".length);
  }

  if (result.startsWith("preprod")) {
    result = result.slice("preprod".length);
  }

  return result;
}

function isSupportedCanonicalHost(hostname) {
  return ALLOWED_CANONICAL_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
}

function detectEnvironment(hostname) {
  const canonical = getCanonicalProdHostname(hostname);

  if (!isSupportedCanonicalHost(canonical)) {
    return ENV.UNSUPPORTED;
  }

  if (hostname.endsWith(".localhost")) {
    return ENV.LOCALHOST;
  }

  if (hostname.startsWith("preprod")) {
    return ENV.PREPROD;
  }

  return ENV.PROD;
}

function buildHostnameForEnv(hostname, targetEnv) {
  const canonical = getCanonicalProdHostname(hostname);

  if (!isSupportedCanonicalHost(canonical)) {
    return null;
  }

  switch (targetEnv) {
    case ENV.PROD:
      return canonical;
    case ENV.PREPROD:
      return `preprod${canonical}`;
    case ENV.LOCALHOST:
      return `${canonical}.localhost`;
    default:
      return null;
  }
}

function buildUrlForEnv(rawUrl, targetEnv) {
  const url = new URL(rawUrl);
  const targetHostname = buildHostnameForEnv(url.hostname, targetEnv);

  if (!targetHostname) {
    return null;
  }

  url.hostname = targetHostname;
  return url.toString();
}

function getAvailableTargets(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const currentEnv = detectEnvironment(url.hostname);

    if (currentEnv === ENV.UNSUPPORTED) {
      return {
        currentEnv,
        supported: false,
        urls: {}
      };
    }

    return {
      currentEnv,
      supported: true,
      urls: {
        [ENV.PROD]: buildUrlForEnv(rawUrl, ENV.PROD),
        [ENV.PREPROD]: buildUrlForEnv(rawUrl, ENV.PREPROD),
        [ENV.LOCALHOST]: buildUrlForEnv(rawUrl, ENV.LOCALHOST)
      }
    };
  } catch {
    return {
      currentEnv: ENV.UNSUPPORTED,
      supported: false,
      urls: {}
    };
  }
}
