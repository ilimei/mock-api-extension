/**
 * 判断 path 是否满足 pathRule
 * pathRule 支持 * 和 :param 的规则
 * @param pathRule 
 * @param path 
 */
export function matchPath(pathRule: string, path: string) {
  const pathRegex = pathRule
    .replace(/\*/g, '.*')
    .replace(/:(\w+)/g, '(?<$1>[^/]+)');
  const regex = new RegExp(`^${pathRegex}$`);
  return regex.test(path);
}

/**
 * 判断 utl 是否满足 domainRule
 * domainRule 支持 * 的规则
 * @param domainRule 
 * @param url 
 */
export function matchDomain(domainRule: string, url: string) {
  const uri = new URL(url);
  
  // Extract protocol and hostname from domainRule if it contains protocol
  let domainPattern = domainRule;
  let protocolToMatch = null;
  
  if (domainRule.includes('://')) {
    try {
      // Extract protocol without replacing wildcards
      const protocolMatch = domainRule.match(/^(https?:\/\/)/);
      if (protocolMatch) {
        protocolToMatch = protocolMatch[1];
        // Check protocol match
        if (protocolToMatch && uri.protocol + '//' !== protocolToMatch) {
          return false;
        }
        
        // Extract hostname part preserving wildcards
        domainPattern = domainRule.substring(protocolMatch[0].length);
      }
    } catch {
      // If parsing fails, keep original pattern
    }
  }
  
  // Escape dots and convert wildcards
  const domainRegex = domainPattern
    .replace(/\./g, '\\.') // Escape dots
    .replace(/\*/g, '.*');  // Convert * to .*
    
  const regex = new RegExp(`^${domainRegex}$`);
  return regex.test(uri.hostname);
}
