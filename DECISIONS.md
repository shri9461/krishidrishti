# Engineering Decisions & Architecture Rationale (DECISIONS.md)

---

### 1. Ingestion Strategy & Rejected Alternatives

* **Chosen Strategy:** **Synchronous Hybrid Microservice Ingestion with In-Memory Stream Decoding & Graceful Fallback**  
  Leaf images and farmer queries are ingested directly via a high-throughput, lightweight FastAPI endpoint into an in-memory buffer (`np.frombuffer` / OpenCV) for immediate classification, accompanied by direct REST and Socket.io push for weather and real-time advisory broadcasts.
* **Rejected Alternative:** **Asynchronous Distributed Queuing (Kafka / RabbitMQ + S3 / Blob Staging)**  
  Staging raw images to cloud object storage before triggering worker queues was rejected because:
  1. **Latency & UX:** Farmers operating in rural edge environments require immediate, sub-second diagnostic feedback in the field rather than polling a delayed asynchronous job status.
  2. **Operational Footprint:** Managing distributed broker infrastructure and multi-hop I/O introduces unnecessary serialization latency, storage egress costs, and architectural overhead for real-time agricultural telemetry and single-image diagnostics.

---

### 2. Time-Constrained Trade-Offs vs. 1-Week Roadmap

* **Trade-Off Made Under Time Limit:**  
  * **Simulation & Heuristic Inference Fallback:** Rather than training and hosting a multi-gigabyte deep neural network (e.g., ResNet/EfficientNet on the full PlantVillage corpus) with live IMD/Agmarknet government API crawlers, we built a hybrid AI service: a TensorFlow neural inference pipeline coupled with an algorithmic OpenCV HSV color-space classifier fallback, backed by structured database seeding.
* **What We Would Build With a Full Week:**
  1. **Edge-Quantized Model (TFLite / ONNX):** Train and quantize a MobileNetV4/Vision Transformer (ViT) on 38+ plant disease classes, enabling offline client-side inference on mobile devices without server dependency.
  2. **Live Scraping & ETL Pipelines:** Deploy scheduled workers (Celery/Redis) with proxy rotation to continuously ingest live government Agmarknet APMC mandi prices and IMD regional weather radars into MongoDB time-series collections.
  3. **Offline-First PWA Synchronization:** Integrate IndexedDB and service workers for zero-connectivity field logging with automatic reconciliation once connectivity resumes.

---

### 3. AI Tool Utilization, Verification & Manual Overrides

* **Where AI Tools Were Used:**
  * Accelerated generation of initial full-stack scaffolding (FastAPI endpoints, React dashboard components, Tailwind layout structures, and Mongoose schema definitions).
  * Synthesizing domain-specific agricultural knowledge bases (symptom catalog, preventative agronomy measures, and government welfare scheme datasets).
* **What Was Personally Verified & Modified Afterward:**
  * **Resilient Dual-Mode AI Classifier:** Handled fallback execution logic when TensorFlow weights (`.h5`) or GPU libraries are unavailable, writing custom OpenCV HSV color-segmentation masks to ensure zero-crash reliability.
  * **Authentication & Authorization Hardening:** Audited and refactored JWT token signing, bcrypt pre-save middleware lifecycle hooks, and role-based access control (RBAC) isolating admin operations from farmer dashboards.
  * **Configuration & Cross-Environment Consistency:** Resolved ES module scoping (`import.meta.url`), environment variable path resolutions (`dotenv`), and resilient MongoDB URI fallback handling across both root and microservice workspaces.
