# React Component Studio

React Component Studio is a React + Vite application that uses the Google Gemini API to generate UI components such as buttons, navbars, cards, and pricing sections. The project also includes a complete DevOps starter with Docker, Kubernetes manifests, Prometheus, and Grafana.

## Features

- Gemini-powered component generation
- Live JSX/CSS preview
- Copy-to-clipboard for generated code
- Fast Vite development workflow
- Production Docker image with Nginx
- Kubernetes deployment manifests
- Horizontal Pod Autoscaler
- Prometheus + Grafana observability stack
- Prebuilt Grafana dashboard

## Prerequisites

- Node.js 20+
- npm
- Docker Desktop
- kubectl
- A Kubernetes cluster if you want to deploy to Kubernetes
- Google Gemini API key

## Project Setup

1. Install dependencies.

```bash
npm install
```

2. Create your local environment file.

```bash
cp .env.example .env
```

3. Add your Gemini API key and model.

```env
VITE_GEMINI_API_KEY=your_real_key_here
VITE_GEMINI_MODEL=gemini-3-flash
```

4. Start the development server.

```bash
npm run dev
```

5. Open the app in your browser.

```text
http://localhost:5173
```

## How to Use

1. Write a prompt describing the component you want.
2. Click Generate Component.
3. Review the JSX, CSS, and Live Preview panels.
4. Copy the generated code into your project.

Example prompts:
- Build a glassmorphism pricing card with monthly/yearly toggle.
- Create a responsive navbar with logo and mobile menu.
- Generate a modern CTA button with loading state.

## Google Gemini API Key

1. Go to Google AI Studio: https://aistudio.google.com/app/apikey
2. Sign in with your Google account.
3. Create a new API key.
4. Copy the key into `.env`.

Note: The app uses the key from `VITE_GEMINI_API_KEY`. For production, move API calls to a backend proxy so the key is not exposed in the browser.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Docker

### Build the image

```bash
docker build -t react-component-studio:latest .
```

### Run the container

```bash
docker run --rm -p 8080:80 react-component-studio:latest
```

### Open the app

```text
http://localhost:8080
```

### Files used

- `Dockerfile`
- `nginx/default.conf`
- `.dockerignore`

## Local Observability Stack

This project includes a Docker Compose setup for:

- the app
- Nginx exporter
- Prometheus
- Grafana

### Start everything

```bash
docker compose -f docker-compose.observability.yml up --build
```

### Open services

- App: `http://localhost:8080`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

### Grafana login

- Username: `admin`
- Password: `admin123`

### Dashboard

The dashboard is provisioned automatically:

- `React Studio Overview`

### Monitoring files

- `docker-compose.observability.yml`
- `monitoring/prometheus.yml`
- `monitoring/grafana/provisioning/datasources/datasource.yml`
- `monitoring/grafana/provisioning/dashboards/dashboard.yml`
- `monitoring/grafana/dashboards/react-studio-overview.json`

## Kubernetes Deployment

### Included manifests

- `k8s/namespace.yaml`
- `k8s/deployment.yaml`
- `k8s/service.yaml`
- `k8s/ingress.yaml`
- `k8s/hpa.yaml`
- `k8s/service-monitor.yaml`
- `k8s/kustomization.yaml`

### Deploy the app

```bash
kubectl apply -k k8s
```

### Verify resources

```bash
kubectl get all -n react-studio
```

### Push the image to your registry

If you are deploying to a real cluster, tag and push the image first.

```bash
docker tag react-component-studio:latest your-dockerhub-username/react-component-studio:latest
docker push your-dockerhub-username/react-component-studio:latest
```

Then update the image reference in `k8s/deployment.yaml`.

### Access the app

If you are using an ingress controller locally, map the host:

- Host: `react-studio.local`
- URL: `http://react-studio.local`

Or use port-forwarding:

```bash
kubectl port-forward -n react-studio svc/react-component-studio 8080:80
```

### Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

Apply the ServiceMonitor:

```bash
kubectl apply -f k8s/service-monitor.yaml
```

Port-forward Grafana from the cluster:

```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

## Project Structure

```text
.
├── Dockerfile
├── docker-compose.observability.yml
├── k8s/
├── monitoring/
├── nginx/
├── public/
├── src/
└── vite.config.js
```

## Notes

- The live preview is sandboxed and runs generated code in an isolated iframe.
- The app is optimized for UI generation workflows, not for server-side Gemini execution.
- For production deployments, store secrets in Kubernetes Secrets or a backend service rather than in `.env` files.

## License

No license file is currently included. Add one if you want to distribute the project publicly.
