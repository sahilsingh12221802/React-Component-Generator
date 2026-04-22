# React Component Studio (Gemini Powered)

This project is a React + Vite dashboard that generates React UI components (buttons, navbars, cards, etc.) using the Google Gemini API.

This repository now also includes a complete DevOps starter:
- Docker production image (Node build + Nginx runtime)
- Kubernetes deployment (Deployment, Service, Ingress, HPA)
- Prometheus + Grafana observability stack
- Prebuilt Grafana dashboard for app traffic and connections

## 1) Get Gemini API Key

1. Open Google AI Studio: https://aistudio.google.com/app/apikey
2. Sign in with your Google account.
3. Click Create API key.
4. Copy the generated key.

## 2) Project Setup

1. Install dependencies:

```bash
npm install
```

2. Create your env file:

```bash
cp .env.example .env
```

3. Add your API key in .env:

```env
VITE_GEMINI_API_KEY=your_real_key_here
VITE_GEMINI_MODEL=gemini-3-flash
```

4. Start development server:

```bash
npm run dev
```

## 3) How To Use

1. Open the dashboard in your browser.
2. Write a prompt like: Create a responsive navbar with dropdown and mobile menu.
3. Click Generate Component.
4. View JSX, CSS, and Live Preview.
5. Copy the code and paste into your project components.

## Important Note (Security)

This demo calls Gemini directly from the browser using a Vite environment variable.
For production apps, use a backend API proxy so your API key is not exposed to users.

## 4) Docker (Step by Step)

1. Build image:

```bash
docker build -t react-component-studio:latest .
```

2. Run container:

```bash
docker run --rm -p 8080:80 react-component-studio:latest
```

3. Open app:

```text
http://localhost:8080
```

Files used:
- `Dockerfile`
- `nginx/default.conf`
- `.dockerignore`

## 5) Local Observability (Prometheus + Grafana)

This starts app + nginx exporter + prometheus + grafana.

1. Start stack:

```bash
docker compose -f docker-compose.observability.yml up --build
```

2. Open services:
- App: `http://localhost:8080`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`

3. Grafana login:
- Username: `admin`
- Password: `admin123`

4. Dashboard is auto-provisioned:
- `React Studio Overview`

Files used:
- `docker-compose.observability.yml`
- `monitoring/prometheus.yml`
- `monitoring/grafana/provisioning/*`
- `monitoring/grafana/dashboards/react-studio-overview.json`

## 6) Kubernetes (Step by Step)

Prerequisites:
- Kubernetes cluster (Minikube, kind, EKS, AKS, GKE)
- `kubectl`
- Ingress controller installed (Nginx ingress)
- Metrics server installed (for HPA)

### 6.1 Push image to registry

1. Tag image:

```bash
docker tag react-component-studio:latest your-dockerhub-username/react-component-studio:latest
```

2. Push image:

```bash
docker push your-dockerhub-username/react-component-studio:latest
```

3. Update image in `k8s/deployment.yaml` if needed.

### 6.2 Deploy app

```bash
kubectl apply -k k8s
```

Verify:

```bash
kubectl get all -n react-studio
```

### 6.3 Access app

If using ingress locally, map host and open:
- Host: `react-studio.local`
- URL: `http://react-studio.local`

Or port-forward service:

```bash
kubectl port-forward -n react-studio svc/react-component-studio 8080:80
```

### 6.4 Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install kube-prometheus-stack prometheus-community/kube-prometheus-stack \
	-n monitoring --create-namespace
```

Then apply ServiceMonitor for app metrics:

```bash
kubectl apply -f k8s/service-monitor.yaml
```

### 6.5 Open Grafana in cluster

```bash
kubectl port-forward -n monitoring svc/kube-prometheus-stack-grafana 3000:80
```

Import dashboard file:
- `monitoring/grafana/dashboards/react-studio-overview.json`

Kubernetes files included:
- `k8s/namespace.yaml`
- `k8s/deployment.yaml`
- `k8s/service.yaml`
- `k8s/ingress.yaml`
- `k8s/hpa.yaml`
- `k8s/service-monitor.yaml`
- `k8s/kustomization.yaml`
