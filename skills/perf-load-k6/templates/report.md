# Performance test: <service>, <date>

**Verdict:** <meets / does not meet> the SLOs at <target rate>. <One sentence on the main risk.>

| Journey | Target p95 | p95 | p99 | Errors | Result |
|---|---|---|---|---|---|
| browse | 500 ms | | | | |
| order | 1000 ms | | | | |

**Capacity:** knee at about <N> journeys/s (p95 starts rising faster than load); breaking point at <M>/s (<what failed>).

**Bottleneck:** <resource that ran out first>, evidence: <graph / log line / slow query>. Suggested fix: <...>.

**Setup:** profile <load/stress/...>, duration <...>, generator <local / cloud, CPU peak %>, environment <...>, build <commit>.

**Assumptions and gaps:** workload model source <analytics / estimate agreed with ...>; not tested: <...>.
