from sqlalchemy import (
    Column, String, Float, Boolean, Integer, Text, DateTime, Enum, ForeignKey, JSON
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

Base = declarative_base()

def gen_uuid():
    return str(uuid.uuid4())

# ─── Enums ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    VARKARI = "VARKARI"
    VOLUNTEER = "VOLUNTEER"
    MEDICAL_TEAM = "MEDICAL_TEAM"
    POLICE = "POLICE"
    NGO = "NGO"
    SERVICE_PROVIDER = "SERVICE_PROVIDER"
    CLEANER = "CLEANER"
    ADMIN = "ADMIN"

class SOSCategory(str, enum.Enum):
    MEDICAL = "MEDICAL"
    ACCIDENT = "ACCIDENT"
    LOST = "LOST"
    WOMEN_SAFETY = "WOMEN_SAFETY"
    CHILD = "CHILD"
    DEHYDRATION = "DEHYDRATION"
    FATIGUE = "FATIGUE"
    OTHER = "OTHER"

class SOSStatus(str, enum.Enum):
    CREATED = "CREATED"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    VOLUNTEER_ASSIGNED = "VOLUNTEER_ASSIGNED"
    MEDICAL_ASSIGNED = "MEDICAL_ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    CANCELLED = "CANCELLED"

class PostType(str, enum.Enum):
    FOOD_AVAILABLE = "FOOD_AVAILABLE"
    WATER_AVAILABLE = "WATER_AVAILABLE"
    SHELTER_AVAILABLE = "SHELTER_AVAILABLE"
    MEDICAL_HELP = "MEDICAL_HELP"
    ROUTE_WARNING = "ROUTE_WARNING"
    WEATHER_WARNING = "WEATHER_WARNING"
    LOST_PERSON = "LOST_PERSON"
    FOUND_PERSON = "FOUND_PERSON"
    HELP_REQUEST = "HELP_REQUEST"
    GENERAL = "GENERAL"

class HelpCategory(str, enum.Enum):
    FOOD = "FOOD"
    WATER = "WATER"
    MEDICINE = "MEDICINE"
    SHELTER = "SHELTER"
    WHEELCHAIR = "WHEELCHAIR"
    CHARGER = "CHARGER"
    UMBRELLA = "UMBRELLA"
    VOLUNTEER = "VOLUNTEER"
    MEDICAL = "MEDICAL"
    TRANSPORT = "TRANSPORT"

class HelpStatus(str, enum.Enum):
    OPEN = "OPEN"
    MATCHED = "MATCHED"
    ACCEPTED = "ACCEPTED"
    IN_PROGRESS = "IN_PROGRESS"
    FULFILLED = "FULFILLED"
    CANCELLED = "CANCELLED"

class ToiletStatus(str, enum.Enum):
    CLEAN = "CLEAN"
    NEEDS_CLEANING = "NEEDS_CLEANING"
    MAINTENANCE = "MAINTENANCE"
    CLOSED = "CLOSED"

class WaterStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    LOW = "LOW"
    EMPTY = "EMPTY"
    MAINTENANCE = "MAINTENANCE"

class CrowdLevel(str, enum.Enum):
    GREEN = "GREEN"
    YELLOW = "YELLOW"
    ORANGE = "ORANGE"
    RED = "RED"

class RelayStatus(str, enum.Enum):
    CREATED = "CREATED"
    RELAYED = "RELAYED"
    GATEWAY_RECEIVED = "GATEWAY_RECEIVED"
    SERVER_RECEIVED = "SERVER_RECEIVED"
    DELIVERED = "DELIVERED"

class VolunteerStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    BUSY = "BUSY"
    OFFLINE = "OFFLINE"

class MealType(str, enum.Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"
    SNACKS = "SNACKS"


# ─── Models ───────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.VARKARI)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    profile = relationship("Profile", back_populates="user", uselist=False)
    sos_incidents = relationship("SOSIncident", back_populates="user")
    community_posts = relationship("CommunityPost", back_populates="author")
    notifications = relationship("Notification", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    display_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    emergency_phone = Column(String, nullable=True)
    language = Column(String, default="mr")  # mr=Marathi, hi=Hindi, en=English
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    avatar_url = Column(String, nullable=True)
    qr_code = Column(String, nullable=True)
    medical_notes = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


class VolunteerProfile(Base):
    __tablename__ = "volunteer_profiles"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(Enum(VolunteerStatus), default=VolunteerStatus.AVAILABLE)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    skills = Column(JSON, default=list)
    organization = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class FoodCentre(Base):
    __tablename__ = "food_centres"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    meal_types = Column(JSON, default=list)
    available_now = Column(Boolean, default=True)
    opening_time = Column(String, default="06:00")
    closing_time = Column(String, default="21:00")
    estimated_queue_minutes = Column(Integer, default=5)
    capacity = Column(Integer, default=500)
    current_count = Column(Integer, default=0)
    hygiene_rating = Column(Float, default=4.0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class WaterPoint(Base):
    __tablename__ = "water_points"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(WaterStatus), default=WaterStatus.AVAILABLE)
    water_type = Column(String, default="drinking")
    capacity_liters = Column(Integer, default=1000)
    last_refilled = Column(DateTime, default=datetime.utcnow)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Toilet(Base):
    __tablename__ = "toilets"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(ToiletStatus), default=ToiletStatus.CLEAN)
    total_units = Column(Integer, default=4)
    gender = Column(String, default="mixed")  # male, female, mixed
    last_cleaned_at = Column(DateTime, default=datetime.utcnow)
    last_cleaned_by = Column(String, nullable=True)
    qr_code = Column(String, nullable=True)
    rating = Column(Float, default=4.0)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Shelter(Base):
    __tablename__ = "shelters"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, default=100)
    current_occupancy = Column(Integer, default=0)
    available_now = Column(Boolean, default=True)
    provider = Column(String, nullable=True)
    address = Column(String, nullable=True)
    amenities = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class WellnessCentre(Base):
    __tablename__ = "wellness_centres"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    services = Column(JSON, default=list)
    available_now = Column(Boolean, default=True)
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class MedicalLocation(Base):
    __tablename__ = "medical_locations"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    location_type = Column(String, default="first_aid")  # hospital, camp, first_aid, ambulance
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    services = Column(JSON, default=list)
    available = Column(Boolean, default=True)
    capacity = Column(Integer, default=20)
    contact = Column(String, nullable=True)
    operating_hours = Column(String, default="24/7")
    address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SOSIncident(Base):
    __tablename__ = "sos_incidents"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(Enum(SOSCategory), default=SOSCategory.OTHER)
    status = Column(Enum(SOSStatus), default=SOSStatus.CREATED)
    description = Column(Text, nullable=True)
    blood_group = Column(String, nullable=True)
    emergency_contact = Column(String, nullable=True)
    is_offline = Column(Boolean, default=False)
    responder_id = Column(String, nullable=True)
    responder_name = Column(String, nullable=True)
    responder_distance_m = Column(Float, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="sos_incidents")


class CommunityPost(Base):
    __tablename__ = "community_posts"
    id = Column(String, primary_key=True, default=gen_uuid)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    author_name = Column(String, nullable=False)
    post_type = Column(Enum(PostType), default=PostType.GENERAL)
    message = Column(Text, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=2.0)
    is_verified = Column(Boolean, default=False)
    upvotes = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    author = relationship("User", back_populates="community_posts")


class HelpRequest(Base):
    __tablename__ = "help_requests"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    category = Column(Enum(HelpCategory), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    urgency = Column(Integer, default=5)  # 1-10
    status = Column(Enum(HelpStatus), default=HelpStatus.OPEN)
    matched_offer_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class HelpOffer(Base):
    __tablename__ = "help_offers"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    category = Column(Enum(HelpCategory), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    status = Column(Enum(HelpStatus), default=HelpStatus.OPEN)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class LostPerson(Base):
    __tablename__ = "lost_persons"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    last_seen_latitude = Column(Float, nullable=True)
    last_seen_longitude = Column(Float, nullable=True)
    last_seen_at = Column(DateTime, nullable=True)
    reported_by = Column(String, ForeignKey("users.id"), nullable=False)
    emergency_contact = Column(String, nullable=True)
    blood_group = Column(String, nullable=True)
    status = Column(String, default="MISSING")  # MISSING, FOUND
    photo_url = Column(String, nullable=True)
    qr_code = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CrowdZone(Base):
    __tablename__ = "crowd_zones"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    radius_m = Column(Float, default=500)
    current_density = Column(Float, default=0.3)  # 0-1
    crowd_level = Column(Enum(CrowdLevel), default=CrowdLevel.GREEN)
    estimated_count = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RelayNode(Base):
    __tablename__ = "relay_nodes"
    id = Column(String, primary_key=True, default=gen_uuid)
    node_id = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    battery_pct = Column(Integer, default=85)
    signal_strength = Column(Integer, default=-70)  # dBm
    is_gateway = Column(Boolean, default=False)
    is_online = Column(Boolean, default=True)
    last_seen = Column(DateTime, default=datetime.utcnow)


class RelayMessage(Base):
    __tablename__ = "relay_messages"
    id = Column(String, primary_key=True, default=gen_uuid)
    sos_id = Column(String, nullable=True)
    payload = Column(JSON, nullable=False)
    status = Column(Enum(RelayStatus), default=RelayStatus.CREATED)
    hop_count = Column(Integer, default=0)
    path = Column(JSON, default=list)  # list of node_ids traversed
    created_at = Column(DateTime, default=datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, default="INFO")
    priority = Column(String, default="MEDIUM")
    is_read = Column(Boolean, default=False)
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class CleaningLog(Base):
    __tablename__ = "cleaning_logs"
    id = Column(String, primary_key=True, default=gen_uuid)
    toilet_id = Column(String, ForeignKey("toilets.id"), nullable=False)
    cleaned_by = Column(String, ForeignKey("users.id"), nullable=False)
    cleaned_at = Column(DateTime, default=datetime.utcnow)
    status_before = Column(String, nullable=True)
    issues = Column(Text, nullable=True)


class WeatherAlert(Base):
    __tablename__ = "weather_alerts"
    id = Column(String, primary_key=True, default=gen_uuid)
    alert_type = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="LOW")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, nullable=True)
    action = Column(String, nullable=False)
    resource = Column(String, nullable=True)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
