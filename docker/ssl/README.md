# SSL Certificates Directory

This directory is for SSL certificates when running in standalone mode.

## For Production (Let's Encrypt):

Place your certificates here:

- `your-domain.crt` (full chain certificate)
- `your-domain.key` (private key)

## For Development/Testing:

You can generate self-signed certificates for local testing:

```bash
# Generate self-signed certificate for local development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout docker/ssl/localhost.key \
    -out docker/ssl/localhost.crt \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Let's Encrypt Setup:

Use the provided script to set up Let's Encrypt certificates:

```bash
./scripts/setup-ssl.sh your-domain.com your-email@domain.com
```
