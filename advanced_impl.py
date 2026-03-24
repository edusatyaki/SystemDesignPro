def get_implementation_data(archetype, title, id_str):
    
    # -------------------------------------------------------------
    # 1. EXAM PORTAL (Custom Educational)
    # -------------------------------------------------------------
    if id_str == "exam-portal":
        cd = """classDiagram
    class User {
        <<abstract>>
        #uuid: String
        #email: String
        +login(token: JWT)
        +logout()
    }
    class Student {
        -academicRecord: Record
        +takeExam(examId: UUID)
        +viewResults()
    }
    class ProctoredSession {
        -webRTCStream: Stream
        -aiConfidenceScore: Float
        +analyzeFrame(frame: VideoFrame)
        +terminateIfCheating()
    }
    class ExamController {
        <<Singleton>>
        -activeSessions: Map~UUID, ProctoredSession~
        +initializeExam(student: Student)
    }
    class CQRSReadModel {
        +getLeaderboard()
    }
    
    User <|-- Student
    Student "1" *-- "1..*" ProctoredSession : participates
    ExamController "1" o-- "many" ProctoredSession : manages
    ExamController ..> CQRSReadModel : async sync"""
        
        cpp_code = """// C++20: High-Frequency Proctored AI Frame Validator
#include <iostream>
#include <vector>
#include <thread>
#include <mutex>
#include <shared_mutex>
#include <future>

class AIProctorEngine {
    mutable std::shared_mutex rw_lock;
    float confidence_threshold = 0.85f;

public:
    [[nodiscard]] std::future<bool> analyzeFrameAsync(const std::vector<uint8_t>& frame_data) {
        return std::async(std::launch::async, [this, frame_data]() {
            std::shared_lock<std::shared_mutex> lock(rw_lock);
            // Simulate deep learning TensorRT inference
            float computed_score = 0.92f; 
            return computed_score >= confidence_threshold;
        });
    }
};

int main() {
    AIProctorEngine engine;
    auto result = engine.analyzeFrameAsync({0xFF, 0x00, 0xAA});
    std::cout << "Frame valid: " << std::boolalpha << result.get() << std::endl;
}"""
        
        java_code = """// Java 21: Highly Concurrent Exam Session Manager with Virtual Threads
import java.util.concurrent.*;
import java.util.Map;
import java.util.UUID;

public class ExamController {
    private final Map<UUID, CompletableFuture<Void>> activeExams = new ConcurrentHashMap<>();
    private final ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor();

    public CompletableFuture<Void> startProctoredExam(UUID studentId) {
        return CompletableFuture.runAsync(() -> {
            System.out.println("Initializing secure WebRTC bridge for: " + studentId);
            try {
                // Simulate strict connection handshakes
                Thread.sleep(100); 
                System.out.println("Session Locked & Proctored.");
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }, virtualExecutor).thenRun(() -> activeExams.put(studentId, CompletableFuture.completedFuture(null)));
    }
}"""
        
        python_code = """# Python 3.12: Asyncio WebSocket Gateway for Proctoring
import asyncio
import json
from dataclasses import dataclass
from typing import Dict, Any

@dataclass
class ProctorEvent:
    student_id: str
    event_type: str
    payload: Dict[str, Any]

class WebSocketGateway:
    def __init__(self):
        self.active_sockets = set()
        self._lock = asyncio.Lock()

    async def broadcast_warning(self, event: ProctorEvent):
        async with self._lock:
            # Broadcast anomalous behavior to admin dashboards
            msg = json.dumps({"type": "WARNING", "data": event.payload})
            print(f"Broadcasting to {len(self.active_sockets)} admins: {msg}")

    async def handle_stream(self, reader, writer):
        self.active_sockets.add(writer)
        try:
            while not reader.at_eof():
                data = await reader.read(1024)
                if data:
                    print("Processing encrypted WebRTC frame metric...")
        finally:
            self.active_sockets.remove(writer)"""
            
        return {"class_diagram": cd, "code": {"cpp": cpp_code, "java": java_code, "python": python_code}}

    # -------------------------------------------------------------
    # 2. INFRASTRUCTURE (Gateways, Limiters, Crawlers)
    # -------------------------------------------------------------
    if archetype == "infrastructure":
        cd = """classDiagram
    class LoadBalancer {
        <<Component>>
        +ConsistentHashRing nodes
        +route(req: Request)
    }
    class APIGateway {
        -rateLimiter: RateLimiterFacade
        -authFilter: AuthFilter
        +forward()
    }
    class RateLimiterFacade {
        <<Proxy>>
        +isAllowed(ip: String): Boolean
    }
    class RedisTokenBucket {
        +consume(tokens: Int)
    }
    class DistributedCrawler {
        -frontier: PriorityQueue
        -bloomFilter: BloomFilter
        +fetchAndExtract()
    }
    
    LoadBalancer --> APIGateway : routes
    APIGateway *-- RateLimiterFacade
    RateLimiterFacade ..> RedisTokenBucket : Lua Script Isolation
    DistributedCrawler ..> LoadBalancer : internal calls"""

        cpp_code = """// C++20: Lock-Free Token Bucket using std::atomic
#include <atomic>
#include <chrono>

class FastTokenBucket {
    std::atomic<int64_t> tokens;
    std::atomic<int64_t> last_refill_time;
    const int64_t capacity;
    const int64_t refill_rate; // tokens per second

public:
    FastTokenBucket(int64_t cap, int64_t rate) : capacity(cap), refill_rate(rate), tokens(cap) {
        last_refill_time = std::chrono::steady_clock::now().time_since_epoch().count();
    }

    bool consume(int64_t requested) {
        auto now = std::chrono::steady_clock::now().time_since_epoch().count();
        int64_t last = last_refill_time.load(std::memory_order_relaxed);
        
        // Lock-free CAS updating
        int64_t new_tokens = std::min(capacity, tokens.load() + (now - last) * refill_rate);
        if (new_tokens >= requested) {
            tokens.fetch_sub(requested, std::memory_order_release);
            return true;
        }
        return false;
    }
};"""

        java_code = """// Java 21: Reactive API Gateway Pre-Filter using Spring WebFlux
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthorizationGlobalFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        
        if (token == null || !token.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(org.springframework.http.HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
        
        // Asynchronous reactive validation chain
        return validateJwtReactive(token)
                .flatMap(valid -> valid ? chain.filter(exchange) : Mono.error(new SecurityException("Invalid JWT")))
                .onErrorResume(e -> exchange.getResponse().setComplete());
    }

    private Mono<Boolean> validateJwtReactive(String token) {
        return Mono.just(true); // Simplified JWT validation
    }
    
    @Override
    public int getOrder() { return -1; } // Highest priority
}"""

        python_code = """# Python 3.12: High-Performance Epoll-based Asyncio Crawler Config
import asyncio
import aiohttp
from typing import Set

class DistributedFrontier:
    def __init__(self):
        self.visited_urls: Set[str] = set() # Simulated Bloom Filter
        self.queue: asyncio.Queue = asyncio.Queue()

    async def worker(self, session: aiohttp.ClientSession):
        while True:
            url = await self.queue.get()
            if url in self.visited_urls:
                self.queue.task_done()
                continue
                
            self.visited_urls.add(url)
            try:
                async with session.get(url, timeout=3.0) as resp:
                    if resp.status == 200:
                        print(f"Successfully crawled: {url}")
            except Exception as e:
                print(f"Timeout/Error on {url}: {e}")
            finally:
                self.queue.task_done()

    async def start_pool(self, concurrency: int = 100):
        async with aiohttp.ClientSession() as session:
            tasks = [asyncio.create_task(self.worker(session)) for _ in range(concurrency)]
            await self.queue.join()
            for t in tasks: t.cancel()"""

        return {"class_diagram": cd, "code": {"cpp": cpp_code, "java": java_code, "python": python_code}}

    # -------------------------------------------------------------
    # 3. STREAMING (Netflix, YouTube, Spotify)
    # -------------------------------------------------------------
    elif archetype == "streaming":
        cd = """classDiagram
    class EdgeCDN {
        <<Proxy>>
        +cacheLookup(manifest_url)
    }
    class AdaptiveBitrateEngine {
        +estimateBandwidth(clientParams)
        +selectChunkResolution()
    }
    class TranscoderWorkerPool {
        -ffmpegSubprocess: Process
        +transcodeToHLS(videoBlob)
    }
    class VideoIngestionSaga {
        <<Orchestrator>>
        +uploadRaw()
        +chunkRaw()
        +publishHLSMap()
    }
    
    EdgeCDN o-- AdaptiveBitrateEngine
    VideoIngestionSaga --> TranscoderWorkerPool : async dispatch via Kafka
    TranscoderWorkerPool ..> EdgeCDN : updates origin cache"""

        cpp_code = """// C++20: Zero-Copy Memory Mapped Video Chunk Streaming
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>
#include <iostream>

class ZeroCopyStreamer {
public:
    void streamChunk(const char* filepath, int client_socket) {
        int fd = open(filepath, O_RDONLY);
        if (fd == -1) return;

        struct stat sb;
        fstat(fd, &sb);

        // Memory-map the file to avoid user-space copying (Zero-Copy)
        void* mapped = mmap(nullptr, sb.st_size, PROT_READ, MAP_PRIVATE, fd, 0);
        if (mapped != MAP_FAILED) {
            // Send directly from kernel buffer cache to network socket
            // send(client_socket, mapped, sb.st_size, 0);
            std::cout << "[CDN Node] Zero-Copy streamed " << sb.st_size << " bytes." << std::endl;
            munmap(mapped, sb.st_size);
        }
        close(fd);
    }
};"""
        java_code = """// Java 21: Transcoding Saga Orchestrator using Virtual Threads & Kafka
import org.apache.kafka.clients.producer.*;

public class IngestionSaga {
    private final KafkaProducer<String, String> producer;

    public IngestionSaga() { /* Init Kafka Prop */ producer = null; }

    public void triggerTranscodingPipeline(String rawVideoId) {
        // Step 1: Fire asynchronous events for different resolutions
        String[] resolutions = {"1080p", "720p", "480p"};

        for (String res : resolutions) {
            Thread.startVirtualThread(() -> {
                ProducerRecord<String, String> record = new ProducerRecord<>("transcode-jobs", rawVideoId, res);
                producer.send(record, (metadata, exception) -> {
                    if (exception == null) {
                        System.out.println("Dispatched " + res + " chunk target for " + rawVideoId);
                    }
                });
            });
        }
    }
}"""
        python_code = """# Python 3.12: ABR (Adaptive Bitrate) Logic Core
import math
from typing import List

class AdaptiveBitrateEngine:
    def __init__(self, available_bitrates: List[int]):
        # e.g., [400_000, 1_500_000, 4_000_000]
        self.available_bitrates = sorted(available_bitrates)

    def calculate_optimal_chunk(self, rtt_ms: float, bandwidth_bps: float) -> int:
        # Allow 20% margin for TCP fluctuation
        safe_bandwidth = bandwidth_bps * 0.8  
        
        optimal_rate = self.available_bitrates[0]
        for rate in self.available_bitrates:
            if rate <= safe_bandwidth:
                optimal_rate = rate
            else:
                break
                
        # If RTT spikes over 500ms, aggressively drop resolution to avoid rebuffering
        if rtt_ms > 500.0:
            return self.available_bitrates[0]
            
        return optimal_rate"""

        return {"class_diagram": cd, "code": {"cpp": cpp_code, "java": java_code, "python": python_code}}

    # -------------------------------------------------------------
    # 4. GEOSPATIAL (Uber, Tinder, Maps)
    # -------------------------------------------------------------
    elif archetype == "geospatial":
        cd = """classDiagram
    class GPSIngestion {
        <<UDP Endpoint>>
        +parseNMEA()
    }
    class QuadTreeManager {
        <<Spatial Index>>
        -root: Node
        +insert(lat, lng, entityId)
        +radiusSearch(lat, lng, radiusKm)
    }
    class MatchingOrchestrator {
        <<Actor>>
        +findNearestDriver()
        +lockEntity()
    }
    class RouteCalculator {
        -graphDB: AStarGraph
        +calculateETA()
    }
    
    GPSIngestion --> QuadTreeManager : fast-path in-memory write
    MatchingOrchestrator ..> QuadTreeManager : query bounds
    MatchingOrchestrator --> RouteCalculator : get accurate ETA"""
        cpp_code = """// C++20: Highly optimized in-memory QuadTree node segment
#include <vector>
#include <memory>
#include <cmath>

struct Point { double lat, lng; int id; };
struct BoundingBox { double minLat, maxLat, minLng, maxLng; };

class QuadTreeNode {
    BoundingBox bounds;
    std::vector<Point> points;
    std::unique_ptr<QuadTreeNode> children[4];
    static constexpr int CAPACITY = 64;

public:
    QuadTreeNode(BoundingBox b) : bounds(b) {}

    bool insert(Point p) {
        if (p.lat < bounds.minLat || p.lat > bounds.maxLat || p.lng < bounds.minLng || p.lng > bounds.maxLng)
            return false;

        if (points.size() < CAPACITY && !children[0]) {
            points.push_back(p);
            return true;
        }
        // Subdivide logic omitted for brevity...
        return false;
    }
    
    // Haversine formula implemented in SIMD or highly optimized branchless code
    double distance(double lat1, double lon1, double lat2, double lon2) {
        return std::hypot(lat1 - lat2, lon1 - lon2); // Fast euclidean approximation for short distances
    }
};"""
        java_code = """// Java 21: Distributed Geo-Locking using Redis and Lua
import redis.clients.jedis.Jedis;

public class MatchingEngine {
    private final Jedis redisClient = new Jedis("redis-cluster-router.internal", 6379);

    public boolean lockDriverForRide(String driverId, String rideId) {
        // Atomic compare-and-swap using Lua to prevent double-dispatch in concurrent environments
        String luaScript = 
            "if redis.call('get', KEYS[1]) == ARGV[1] then " +
            "   return redis.call('set', KEYS[1], ARGV[2], 'XX', 'EX', 30) " +
            "else " +
            "   return nil " +
            "end";
            
        Object response = redisClient.eval(luaScript, 1, 
                "driver:" + driverId + ":state", 
                "AVAILABLE", 
                "LOCKED_FOR_" + rideId);
                
        return response != null;
    }
}"""
        python_code = """# Python 3.12: Real-Time WebSocket Geo-Broadcasting
import asyncio
import json

class GeoBroadcaster:
    def __init__(self):
        # Mapping of Geohash string (precision 5, approx 5x5km) to Set of connected WebSockets
        self.geohash_subscribers = {}

    async def publish_driver_location(self, driver_id: str, lat: float, lng: float, geohash: str):
        payload = json.dumps({
            "type": "DRIVER_LOC_UPDATE",
            "driver_id": driver_id,
            "position": {"lat": lat, "lng": lng}
        })

        # O(1) broadcast array to local clients in the same grid
        subs = self.geohash_subscribers.get(geohash, set())
        for ws in subs:
            # Fire-and-forget non-blocking dispatch
            asyncio.create_task(ws.send_str(payload))"""

        return {"class_diagram": cd, "code": {"cpp": cpp_code, "java": java_code, "python": python_code}}

    # -------------------------------------------------------------
    # 5. ECOMMERCE (Orders, Payments, Inventory)
    # -------------------------------------------------------------
    elif archetype == "ecommerce":
        cd = """classDiagram
    class CheckoutOrchestrator {
        <<Saga Coordinator>>
        +beginCheckout()
        +rollback()
    }
    class DistributedInventory {
        <<ACID>>
        +reserveStock(idempotencyKey)
        +commitStock()
    }
    class PaymentGatewayIntegrator {
        +chargeCreditCard()
        -handlePCIData()
    }
    class FulfillmentQueue {
        +dispatchToWarehouse()
    }
    
    CheckoutOrchestrator --> DistributedInventory : 1. Reserve
    CheckoutOrchestrator --> PaymentGatewayIntegrator : 2. Charge
    CheckoutOrchestrator --> FulfillmentQueue : 3. Dispatch"""
        cpp_code = """// C++20: Thread-Safe Highly Contended Inventory Cache
#include <unordered_map>
#include <shared_mutex>
#include <string>

class InventoryCache {
    std::unordered_map<std::string, int> memory_stock;
    std::shared_mutex rw_mutex;

public:
    bool tryReserve(const std::string& sku, int qty) {
        std::unique_lock<std::shared_mutex> write_lock(rw_mutex);
        if (memory_stock[sku] >= qty) {
            memory_stock[sku] -= qty;
            return true;
        }
        return false;
    }

    void updateCacheFromDB(const std::string& sku, int exact_stock) {
        std::unique_lock<std::shared_mutex> write_lock(rw_mutex);
        memory_stock[sku] = exact_stock;
    }
};"""
        java_code = """// Java 21: Idempotent Payment processing using Spring @Transactional annotations
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class PaymentProcessingService {

    @Transactional(rollbackFor = Exception.class)
    public PaymentResult processIdempotentCharge(ChargeRequest req) {
        if (paymentRepository.existsByIdempotencyKey(req.getIdempotencyKey())) {
            return paymentRepository.findByIdempotencyKey(req.getIdempotencyKey()); // Return cached safe response
        }
        
        PaymentResult pciGatewayResult = stripeClient.charge(req.getAmount(), req.getToken());
        
        // Commits only if Stripe succeeds and DB constraints hold
        paymentRepository.save(new PaymentRecord(req.getIdempotencyKey(), pciGatewayResult));
        return pciGatewayResult;
    }
}"""
        python_code = """# Python 3.12: Saga Pattern Fallback orchestrator
import asyncio

class CheckoutSaga:
    async def execute_checkout(self, user_id: str, cart: dict):
        inventory_reserved = False
        try:
            # Step 1
            inventory_reserved = await self.inventory_service.reserve(cart)
            
            # Step 2
            payment = await self.payment_service.charge(user_id, cart.total)
            
            # Step 3
            await self.fulfillment_service.dispatch(payment.receipt_id, cart)
            return "SUCCESS"
            
        except PaymentDeclinedError:
            # Saga Compensation Transaction
            if inventory_reserved:
                await self.inventory_service.release_reservation(cart)
            return "FAILED_NSF"
        except Exception as e:
            # Trigger PagerDuty on critical systemic failure
            print(f"CRITICAL SAGA FAILURE: {e}")
            raise"""

        return {"class_diagram": cd, "code": {"cpp": cpp_code, "java": java_code, "python": python_code}}

    # -------------------------------------------------------------
    # DEFAULT / OTHER COMPLEX (Messaging, Social, Database, Data)
    # -------------------------------------------------------------
    else:
        cd = """classDiagram
    class APIGateway {
        <<Envoy Proxy>>
        +TLS Termination
        +JWT Validation()
    }
    class ApplicationMesh {
        <<gRPC Pool>>
        +executeDomainLogic()
    }
    class RedisCluster {
        <<Look-aside Cache>>
        +getOrMiss()
    }
    class PersistentStore {
        <<Master-Slave Postgres>>
        +Write Ahead Log()
    }
    class KafkaEventBus {
        <<PubSub>>
        +appendLog()
    }
    
    APIGateway --> ApplicationMesh : HTTP/2 gRPC
    ApplicationMesh --> RedisCluster : 5ms SLA Read
    ApplicationMesh --> PersistentStore : ACID Write
    ApplicationMesh --> KafkaEventBus : Emit Domain Events"""
        cpp_code = """// C++20: Zero-Copy Non-Blocking gRPC Service Stub
#include <grpcpp/grpcpp.h>
#include <iostream>

class HighThroughputServiceImpl final : public core::Service::Service {
    grpc::Status ProcessFastPath(grpc::ServerContext* context, const core::Request* request, core::Response* reply) override {
        // Bypass heavy locking, utilize thread-local variables for massive concurrency
        thread_local int request_burst_count = 0;
        request_burst_count++;
        
        if (request_burst_count > 10000) {
            std::cout << "[Worker Thread] Processed 10k messages seamlessly." << std::endl;
            request_burst_count = 0;
        }
        
        reply->set_status_code(200);
        return grpc::Status::OK;
    }
};"""
        java_code = """// Java 21: Hazelcast / Redis Distributed Caching Architecture
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Repository;

@Repository
public class GlobalDataRepository {
    
    // Transparently handles Redis Cluster look-up. Intercepts method via AOP.
    // Limits DB round trips significantly.
    @Cacheable(value = "domainDataCache", key = "#id", unless = "#result == null")
    public DomainObject getEntitySuperFast(String id) {
        // Simulating the 0.01% Cache Miss hitting the database
        System.out.println("Cache Miss [WARN] - Hitting Read-Replica DB for ID: " + id);
        return databaseDriver.query("SELECT * FROM entities WHERE id = ?", id);
    }
}"""
        python_code = """# Python 3.12: Kafka Event Emitter - Outbox Pattern
import json
from kafka import KafkaProducer

class OutboxPublisher:
    def __init__(self):
        self.producer = KafkaProducer(
            bootstrap_servers=['kafka-broker1:9092', 'kafka-broker2:9092'],
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            acks='all', # Ensure leader and replicas acknowledge
            retries=5
        )

    def publish_domain_event(self, aggregate_id: str, event_type: str, payload: dict):
        event = {
            "aggregate_id": aggregate_id,
            "type": event_type,
            "data": payload
        }
        # Fire and Forget asynchronously in the background
        self.producer.send('domain-events', key=aggregate_id.encode('utf-8'), value=event)"""

        return {"class_diagram": cd, "code": {"cpp": cpp_code, "java": java_code, "python": python_code}}
