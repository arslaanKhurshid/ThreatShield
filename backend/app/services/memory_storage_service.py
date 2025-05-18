

from typing import List, Optional
from app.models.log import Log
from app.models.rule import Rule
from app.models.alert import Alert
from app.services.groq_service import GroqService
import logging
from datetime import datetime, timedelta
import json
from pathlib import Path
import uuid
import asyncio
import random

logger = logging.getLogger(__name__)

class MemoryStorageService:
    _instance = None
    _logs: List[Log] = []
    _rules: List[Rule] = []
    _alerts: List[Alert] = []

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MemoryStorageService, cls).__new__(cls)
            # Initialize with data from JSON file and start simulations
            cls._instance._initialize_data()
            # Start background tasks
            asyncio.create_task(cls._instance._simulate_logs())
            asyncio.create_task(cls._instance._simulate_rule_generation())
        return cls._instance

    def _initialize_data(self):
        """Initialize logs, rules, and simulation parameters."""
        # Initialize GroqService
        self.groq_service = GroqService()

        # Default rules
        default_rules = [
            Rule(
                id="rule-002",
                name="Unauthorized Access Rule",
                query="event_type == 'error' AND resource == '/sensitive/data'",
                exclusion_list=[],
                enabled=True
            ),
            Rule(
                id="rule-003",
                name="Admin Activity Rule",
                query="user == 'admin' AND event_type != 'login'",
                exclusion_list=["10.0.0.50"],
                enabled=True
            )
        ]

        # Try to load only the first 10 logs from JSON file
        self.log_file_path = Path("C:\\Users\\arsla\\OneDrive\\Desktop\\tds_demo\\backend\\app\\logs.json")
        try:
            if self.log_file_path.exists():
                with open(self.log_file_path, 'r') as f:
                    log_data = json.load(f)
                    # Limit to first 10 logs
                    log_data = log_data[:10]
                    self._logs = [
                        Log(
                            id=log["id"],
                            timestamp=datetime.fromisoformat(log["timestamp"]),
                            source_ip=log["source_ip"],
                            event_type=log["event_type"],
                            details=log["details"]
                        ) for log in log_data
                    ]
                logger.debug(f"Loaded {len(self._logs)} logs from {self.log_file_path}")
            else:
                logger.warning(f"No logs.json file found at {self.log_file_path}, initializing empty logs")
                self._logs = []
        except Exception as e:
            logger.error(f"Error loading logs from JSON: {str(e)}")
            self._logs = []

        # Load rules
        self._rules = default_rules
        logger.debug(f"Initialized {len(self._rules)} rules")

        # Initialize simulation parameters for logs
        self.event_types = ["login", "error", "access"]
        self.users = ["admin", "jdoe", "guest", "unknown", "dbadmin", "testuser"]
        self.source_ips = [
            "192.168.1.100", "192.168.1.101", "192.168.1.102", "192.168.1.103",
            "10.0.0.50", "10.0.0.51", "10.0.0.52", "172.16.0.10", "172.16.0.11"
        ]
        self.resources = ["/sensitive/data", "/public/index.html", "/api/v1/data", "/downloads/report.pdf"]
        self.current_time = datetime.fromisoformat("2025-04-11T10:13:00")  # Start after last loaded log

    def _generate_log(self) -> Log:
        """Generate a random log with realistic data."""
        event_type = random.choice(self.event_types)
        user = random.choice(self.users)
        source_ip = random.choice(self.source_ips)
        
        # Increment timestamp
        self.current_time += timedelta(seconds=random.randint(5, 10))  # 30s to 1min intervals
        
        # Generate details based on event type
        details = {"event": ""}
        if event_type == "login":
            status = random.choice(["success", "failed"])
            details = {
                "event": "User login attempt",
                "user": user,
                "status": status
            }
        elif event_type == "error":
            error_codes = ["AUTH_002", "TIMEOUT_001", "ACCESS_003"]
            details = {
                "event": random.choice(["Authentication error", "Access denied", "Server timeout"]),
                "error_code": random.choice(error_codes),
                "resource": random.choice(self.resources),
                "user": user
            }
        elif event_type == "access":
            details = {
                "event": random.choice(["File accessed", "File downloaded", "Database query"]),
                "file": random.choice(self.resources) if "file" in random.choice(["File accessed", "File downloaded"]) else None,
                "query": "SELECT * FROM users" if "Database query" in details["event"] else None,
                "user": user
            }
            # Clean up None values
            details = {k: v for k, v in details.items() if v is not None}

        return Log(
            id=str(uuid.uuid4()),
            timestamp=self.current_time,
            source_ip=source_ip,
            event_type=event_type,
            details=details
        )

    async def _simulate_logs(self, min_delay: float = 10.0, max_delay: float = 50.0):
        """Simulate adding new logs at random intervals."""
        logger.info("Starting log simulation")
        while True:
            log = self._generate_log()
            await self.store_log(log)
            logger.info(f"Added log {log.id} with event_type {log.event_type}")
            delay = random.uniform(min_delay, max_delay)
            await asyncio.sleep(delay)

    async def _generate_rule(self) -> Optional[Rule]:
        """Generate a new rule using recent logs and check for duplicates."""
        logs = await self.get_logs()
        if not logs:
            logger.warning("No logs available for rule generation")
            return None

        # Sample up to 5 recent logs
        log_samples = [log.dict() for log in logs[-5:]]
        rule = await self.groq_service.generate_rule(log_samples)
        
        # Check for duplicates
        for existing_rule in self._rules:
            if existing_rule.name == rule.name or existing_rule.query == rule.query:
                logger.info(f"Rule '{rule.name}' or query '{rule.query}' already exists, skipping")
                return None
        
        logger.info(f"Generated new rule: {rule.name}")
        return rule

    async def _simulate_rule_generation(self, interval: float = 60.0):
        """Periodically generate new rules based on recent logs."""
        logger.info("Starting rule generation simulation")
        while True:
            rule = await self._generate_rule()
            if rule:
                await self.store_rule(rule)
                logger.info(f"Stored new rule: {rule.id} - {rule.name}")
            await asyncio.sleep(interval)

    async def store_log(self, log: Log):
        """Store a new log and trigger threat detection."""
        logger.debug(f"Storing log: {log.id}")
        self._logs.append(log)
        # Save to JSON file
        self._save_logs_to_json()

        for rule in self._rules:
            if rule.enabled:
                alerts = await self.groq_service.detect_threats([log], rule)
                self._alerts.extend(alerts)
                for alert in alerts:
                    logger.warning(f"Threat detected: {alert.severity} - {alert.details}")

    def _save_logs_to_json(self):
        """Save current logs to JSON file."""
        try:
            log_data = [
                {
                    "id": log.id,
                    "timestamp": log.timestamp.isoformat(),
                    "source_ip": log.source_ip,
                    "event_type": log.event_type,
                    "details": log.details
                } for log in self._logs
            ]
            with open(self.log_file_path, 'w') as f:
                json.dump(log_data, f, indent=2)
            logger.debug(f"Saved logs to {self.log_file_path}")
        except Exception as e:
            logger.error(f"Error saving logs to JSON: {str(e)}")

    async def get_logs(self) -> List[Log]:
        logger.debug("Retrieving all logs")
        return self._logs

    async def store_rule(self, rule: Rule):
        logger.debug(f"Storing rule: {rule.id}")
        self._rules.append(rule)

    async def get_rules(self) -> List[Rule]:
        logger.debug("Retrieving all rules")
        return self._rules

    async def get_rule(self, rule_id: str) -> Optional[Rule]:
        logger.debug(f"Retrieving rule: {rule_id}")
        for rule in self._rules:
            if rule.id == rule_id:
                return rule
        return None

    async def store_alert(self, alert: Alert):
        logger.debug(f"Storing alert: {alert.id}")
        self._alerts.append(alert)

    async def get_alerts(self) -> List[Alert]:
        logger.debug("Retrieving all alerts")
        return self._alerts