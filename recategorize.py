import json

KEYWORD_MAP = {
    "Blockchain & Cryptocurrency": ["crypto", "bitcoin", "ethereum", "blockchain", "wallet", "transaction", "btc", "eth"],
    "Cloud Security & Recon": ["cloud", "aws", "s3", "azure", "gcp", "bucket"],
    "AI & Threat Detection": [" ai ", "artificial intelligence", "machine learning", "deepfake", "chatgpt", " llm "],
    "Dark Web & Anonymity": ["dark web", " tor ", "onion", "i2p", "anonymity", "proxy", "vpn", "darknet"],
    "Digital Forensics & Incident Response (DFIR)": ["malware", "virus", "sandbox", "forensic", "decompile", "pcap", "packet", "incident", "wireshark"],
    "Cyber Threat Intelligence (CTI)": ["threat", " cti ", " apt ", "vulnerability", "cve", "exploit", "hacker", "attack", "botnet", "intelligence", "ciberseguridad", "security"],
    "Phone OSINT": ["phone", "mobile", "number", "caller", " sms ", "telecommunications", "truecaller", "whatsapp", "telegram", "teléfono"],
    "Email & Username OSINT": ["email", "username", "handle", "breach", " leak", "password", "credential", "haveibeenpwned", "pastebin", "correo"],
    "Social Media Intelligence (SOCMINT)": ["social media", "facebook", "twitter", "instagram", "linkedin", "reddit", "tiktok", "youtube", " vk ", "snapchat", "pinterest", "discord", "social network", "redes sociales"],
    "Transportation OSINT": ["flight", "marine", "traffic", "vehicle", " car ", "plate", "registration", " vin ", "aviation", "ship", "vessel", "vuelo", "vehículo"],
    "Geospatial & Mapping": [" map ", "location", " geo", "coordinates", "satellite", "tracking", "camera", "cctv", "street view", "mapa"],
    "Business & Corporate Registers": ["company", "corporate", "business", "register", "trademark", "patent", "financial", " tax ", "empresa", "negocio"],
    "Media & Document Analysis": ["image", "photo", "video", "document", "pdf", "metadata", "exif", "reverse image", "face recognition", "facial", "ocr", "imagen"],
    "Compliance, Sanctions & Legal": ["sanction", "legal", "court", "compliance", " risk ", " pep "],
    "Dating & Communities": ["dating", "tinder", "badoo", "match", "forum", "community", "foro"],
    "Classifieds & E-commerce": ["classified", "ebay", "amazon", "craigslist", "market", "mercado"],
    "Domain & IP Analysis": ["whois", "domain", " ip ", " dns", "bgp", " asn ", "network", "host", "port", "subnet", "nmap", "shodan", "subdomain", "dominio"],
    "Archives & Databases": ["archive", "wayback", "cache", "public record", "search engine", "database", "repository", " dork", "google search", "buscador", "search"],
    "Encoding & Data Conversion": ["encode", "decode", " hash", "base64", "cipher", "cryptography", "converter", "format"],
    "OSINT Training & Guides": ["tutorial", "guide", "training", "course", "learn", "guía"]
}

def get_category(text):
    text = text.lower()
    for cat, keywords in KEYWORD_MAP.items():
        if any(kw in text for kw in keywords):
            return cat
    return "Miscellaneous OSINT"

data = json.load(open('src/data/tools.json'))
for t in data:
    if t['category'] == 'General OSINT Tools' or t['category'] == 'Miscellaneous OSINT':
        search_text = f" {t['name'].lower()} {t['description'].lower()} "
        t['category'] = get_category(search_text)

json.dump(data, open('src/data/tools.json', 'w'), indent=2)
