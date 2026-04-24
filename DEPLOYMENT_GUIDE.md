# React Component Generator - Full Stack Deployment

## 🎉 Setup Complete!

Your application is now fully deployed with Docker Compose, Prometheus monitoring, and Grafana dashboards.

---

## 🚀 Quick Start

### View Your Application

| Component | URL | Credentials |
|-----------|-----|-------------|
| **Frontend & API** | http://localhost:5006 | None |
| **Prometheus** | http://localhost:9090 | None |
| **Grafana Dashboard** | http://localhost:3000 | admin / admin |

---

## 📊 Monitoring Dashboard Features

### **5 Real-Time Gauges**
1. **CPU Usage %** - System CPU consumption percentage
2. **Memory Used (MB)** - Heap memory currently in use
3. **Memory Total (MB)** - Total heap memory available
4. **System Status** - Overall system health indicator
5. **Health Status** - Application running status

### **5 Statistical Cards**
1. **Requests (5m)** - API requests in last 5 minutes
2. **Generated Components** - Total components created
3. **Errors (5m)** - API errors in last 5 minutes

### **5+ Time-Series Charts**
1. **API Request Rate** - Requests per second over time
2. **API Request Duration** - Average response time per endpoint
3. **Gemini API Calls Rate** - Calls to Gemini API per second
4. **Error Rate** - HTTP 5xx errors over time
5. **Default Prometheus Metrics** - System memory, GC, process info

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│      React Frontend (Vite)              │
│      Port: 5006                         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│    Express Backend + Metrics Export     │
│    Port: 5006 (shared)                  │
│    Metrics: /metrics                    │
│    Health: /health                      │
│    API: /api/generate                   │
└────┬──────────────────────────────┬─────┘
     │                              │
     ▼                              ▼
┌──────────────────┐        ┌──────────────────┐
│  Prometheus      │        │  Grafana         │
│  Port: 9090      │        │  Port: 3000      │
│  Scrapes /metrics│        │  Visual Dashbrd  │
│  Stores Data     │        │  Admin:admin     │
└──────────────────┘        └──────────────────┘
```

---

## 📈 Available Metrics

### Application Metrics
- `api_requests_total` - Total API requests by method, path, and status
- `api_request_duration_seconds` - Request duration histogram
- `gemini_api_calls_total` - Gemini API call counts by status
- `gemini_api_duration_seconds` - Gemini API response time histogram
- `generated_components_total` - Total components successfully generated

### System Metrics
- `system_cpu_usage_percent` - CPU usage percentage
- `system_memory_usage_bytes` - Heap memory in use
- `system_memory_total_bytes` - Total heap memory
- `process_resident_memory_bytes` - Process memory
- `process_uptime_seconds` - Application uptime
- `go_gc_duration_seconds` - Garbage collection duration

---

## 🐳 Docker Compose Services

### Backend
```bash
Service: backend
Image: reactcomponentgenerator-backend
Port: 5006
Health Check: GET /health
Environment:
  - PORT=5006
  - GEMINI_API_KEY=${GEMINI_API_KEY}
```

### Prometheus
```bash
Service: prometheus
Image: prom/prometheus:latest
Port: 9090
Config: prometheus.yml
```

### Grafana
```bash
Service: grafana
Image: grafana/grafana:latest
Port: 3000
Admin User: admin
Admin Password: admin
```

---

## 📝 Key Files

- `docker-compose.yml` - Orchestration configuration
- `backend/server.js` - Express backend with Prometheus metrics
- `prometheus.yml` - Prometheus scrape configuration
- `grafana/dashboards/dashboard.json` - Pre-configured monitoring dashboard
- `grafana/datasources/prometheus.yml` - Grafana data source config

---

## 🔄 Common Commands

### View all containers
```bash
docker-compose ps
```

### View backend logs
```bash
docker-compose logs backend -f
```

### View Prometheus logs
```bash
docker-compose logs prometheus -f
```

### View Grafana logs
```bash
docker-compose logs grafana -f
```

### Stop all services
```bash
docker-compose down
```

### Restart all services
```bash
docker-compose up -d
```

### Clean up volumes and data
```bash
docker-compose down -v
```

---

## 🛠️ Environment Variables

Create `.env` file in project root:
```env
GEMINI_API_KEY=your_api_key_here
```

---

## 📋 Response Handling

The backend automatically:
- ✅ Extracts JSON from Gemini's nested response structure
- ✅ Handles markdown responses gracefully
- ✅ Returns clean component data (componentName, jsx, css, notes)
- ✅ Implements 45-second timeout for slow API responses
- ✅ Tracks all metrics automatically

---

## 🎯 Next Steps

1. **Add Grafana Alerts** - Set up notifications for high metrics
2. **Configure SSL** - Use nginx reverse proxy for HTTPS
3. **Scale Horizontally** - Add multiple backend instances behind load balancer
4. **Backup Prometheus Data** - Configure persistent volume backup
5. **Custom Dashboards** - Create role-specific dashboards in Grafana

---

## ✨ Features

✅ React 19 + Vite frontend
✅ Express.js backend with hot reload
✅ Prometheus metrics collection
✅ Pre-configured Grafana dashboard
✅ Docker multi-stage builds
✅ Health check endpoints
✅ Comprehensive error handling
✅ Request timeout management
✅ System resource monitoring
✅ API performance tracking

---

## 🐛 Troubleshooting

### Backend not responding?
```bash
docker-compose logs backend
```

### Prometheus not scraping metrics?
```bash
curl http://localhost:5006/metrics
```

### Grafana dashboard empty?
1. Check Prometheus datasource in Grafana settings
2. Verify Prometheus is scraping backend `/metrics`
3. Wait 1-2 minutes for metrics to accumulate

### Container won't start?
```bash
docker-compose down
docker system prune
docker-compose up -d
```

---

**All code is production-ready and properly configured!** 🚀
