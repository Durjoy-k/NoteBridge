# NOTEBridge — Project Specification

## Vision

Connecting Knowledge Across Batches.

NOTEBridge preserves academic resources and knowledge between university student generations.

## Users

### Student
- university email
- profile
- department
- program
- batch
- semester

### Admin
- users
- courses
- resources
- reports
- analytics

No Senior role.

---

## Academic Structure

Department
→ Program
→ Course
→ Resource

---

## Resources

Types:

- Lecture Notes
- Previous Questions
- Lab Materials
- Slides
- Study Guides
- Handwritten Notes
- Cheat Sheets
- Reference Materials

Supported:

- PDF
- PPT/PPTX
- DOC/DOCX
- JPG/PNG

Resource actions:

- upload
- view
- download
- bookmark
- rate
- helpful
- report

---

## Search

Search:

- title
- description
- topic
- tags
- course

Filters:

- department
- program
- semester
- course
- resource type
- academic year
- rating

Technology:
PostgreSQL Full Text Search.

---

## Community

Question
→ Answers
→ Votes
→ Best Answer

Questions belong to courses.

---

## Reputation

Actions can earn points:

- useful resource
- useful answer
- previous question contribution

Badges:

- First Contributor
- Knowledge Sharer
- Academic Mentor
- Knowledge Champion

---

## Intelligence

### Recommendations

Rule-based.

Inputs:

- courses
- semester
- bookmarks
- viewed resources
- topic relevance
- rating
- helpful votes
- popularity
- recency

### Previous Question Analysis

Show:

- topic frequency
- yearly trends
- frequently asked topics

---

## AI

Main AI feature:

Chat With This Note.

Pipeline:

PDF
→ text extraction
→ chunking
→ embeddings
→ retrieval
→ LLM
→ grounded answer
→ source references

AI must not invent information.

If answer is unavailable in the note, say so.

---

## Admin

- user management
- department/program/course management
- resource moderation
- reports
- analytics
- audit logs

---

## Architecture

React
→ FastAPI
→ PostgreSQL/Supabase

Supabase:
- Auth
- Database
- Storage

AI accessed through FastAPI.

---

## Non-Goals

Do not build:

- mobile app
- blockchain
- microservices
- Kubernetes
- custom auth
- Elasticsearch
- complex ML recommendation
- real-time chat

---

## Main User Journey

Login
→ Dashboard
→ Course
→ Search
→ Resource
→ Learn
→ Chat With Note
→ Previous Question Analysis
→ Ask Community
→ Contribute
