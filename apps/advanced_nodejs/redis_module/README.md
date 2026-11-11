# Redis - Remote Dictionary Server.

- Redis is a in-memory data structure store, used as a database, cache and message broker.
- It supports various data structures like strings, hashes, lists, sets, sorted sets with range queries, bitmaps, hyperloglogs, geospatial indexes with radius queries and streams.

# Redis Internal Architecture

                 REDIS ARCHITECTURE
                 =================

              +----------------------+
              |   Node.js Client     |
              |  (ioredis / redis)   |
              +----------+-----------+
                         |
                         | TCP Connection
                         |
                         | RESP Protocol
                         v
              +----------------------+
              |     Redis Server     |
              |                      |
              |  +----------------+  |
              |  | Network Layer  |  |
              |  +-------+--------+  |
              |          |           |
              |          v           |
              |  +----------------+  |
              |  | Command Parser |  |
              |  +-------+--------+  |
              |          |           |
              |          v           |
              |  +----------------+  |
              |  | Command        |  |
              |  | Processing     |  |
              |  +-------+--------+  |
              |          |           |
              |          v           |
              |  +----------------+  |
              |  | In-Memory      |  |
              |  | Data Structures|  |
              |  |                |  |
              |  | - Strings      |  |
              |  | - Hashes       |  |
              |  | - Lists        |  |
              |  | - Sets         |  |
              |  | - Sorted Sets  |  |
              |  +-------+--------+  |
              |          |           |
              |          v           |
              |  +----------------+  |
              |  | Persistence    |  |
              |  |                |  |
              |  | - RDB Snapshot |  |
              |  | - AOF Log      |  |
              |  +-------+--------+  |
              +----------+-----------+
                         |
                         v
              +----------------------+
              |     Disk Storage     |
              |                      |
              |  dump.rdb            |
              |  appendonly.aof      |
              +----------------------+

### RDB (Redis Database)

- RDB is a snapshot-based persistence mechanism.
- It saves the entire dataset to disk at regular intervals.
- It is faster to start and recover from.
- It is less durable than AOF.
- It is the default persistence mechanism in Redis.
- It is used for backup and disaster recovery.
- It is used for replication.
- It is used for caching.

### AOF (Append Only File)

- AOF is a write-ahead logging mechanism.
- It logs every write operation to a file.
- It is more durable than RDB.
- It is slower than RDB.
- It is used for backup and disaster recovery.
- It is used for replication.
- It is used for caching.
