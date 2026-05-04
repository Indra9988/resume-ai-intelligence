"""
generate_dataset.py
Generates a labeled dataset of 200+ synthetic resumes across 8 job roles.
Run: python generate_dataset.py
Output: ../data/resumes_dataset.csv
"""

import csv
import random
import os

random.seed(42)

# ── Job role definitions ────────────────────────────────────────────────────
ROLES = {
    "Frontend Developer": {
        "skills": [
            ["React", "JavaScript", "HTML", "CSS", "TypeScript", "Redux", "Webpack", "Jest"],
            ["Vue.js", "JavaScript", "HTML5", "CSS3", "SASS", "Vuex", "Nuxt.js"],
            ["Angular", "TypeScript", "RxJS", "HTML", "CSS", "Jasmine", "Karma"],
            ["React", "Next.js", "TypeScript", "Tailwind CSS", "GraphQL", "Apollo"],
            ["JavaScript", "HTML", "CSS", "Bootstrap", "jQuery", "REST APIs"],
        ],
        "experience_templates": [
            "Built responsive web applications using React and TypeScript for {company}.",
            "Developed reusable UI component libraries with React and Storybook at {company}.",
            "Led frontend architecture redesign improving performance by 40% at {company}.",
            "Collaborated with UX designers to implement pixel-perfect designs at {company}.",
            "Integrated REST APIs and GraphQL endpoints in Angular applications at {company}.",
        ],
        "education": ["B.Tech in Computer Science", "B.E. in Information Technology", "B.Sc in Computer Science"],
        "titles": ["Frontend Developer", "UI Developer", "React Developer", "Web Developer", "UI Engineer"],
    },
    "Backend Developer": {
        "skills": [
            ["Node.js", "Express", "MongoDB", "REST API", "JWT", "Docker", "Redis"],
            ["Python", "Django", "PostgreSQL", "REST API", "Celery", "Redis", "AWS"],
            ["Java", "Spring Boot", "MySQL", "Hibernate", "Maven", "JUnit", "Docker"],
            ["Python", "FastAPI", "PostgreSQL", "SQLAlchemy", "Docker", "Kubernetes"],
            ["Node.js", "TypeScript", "GraphQL", "PostgreSQL", "Prisma", "Docker"],
        ],
        "experience_templates": [
            "Designed and built scalable REST APIs serving 1M+ requests/day at {company}.",
            "Architected microservices using Node.js and Docker at {company}.",
            "Optimized PostgreSQL queries reducing response time by 60% at {company}.",
            "Built authentication systems using JWT and OAuth2 at {company}.",
            "Developed data pipeline processing 500K records daily using Python at {company}.",
        ],
        "education": ["B.Tech in Computer Science", "M.Tech in Software Engineering", "B.E. in CSE"],
        "titles": ["Backend Developer", "Node.js Developer", "Python Developer", "Java Developer", "API Developer"],
    },
    "Data Scientist": {
        "skills": [
            ["Python", "Machine Learning", "TensorFlow", "Pandas", "NumPy", "Scikit-learn", "SQL"],
            ["Python", "Deep Learning", "PyTorch", "NLP", "BERT", "Transformers", "Jupyter"],
            ["R", "Python", "Statistics", "Scikit-learn", "Matplotlib", "Seaborn", "Tableau"],
            ["Python", "XGBoost", "LightGBM", "Feature Engineering", "SQL", "Spark", "Hadoop"],
            ["Python", "Computer Vision", "OpenCV", "CNN", "YOLO", "TensorFlow", "Keras"],
        ],
        "experience_templates": [
            "Built churn prediction model with 92% accuracy reducing customer loss by 25% at {company}.",
            "Developed NLP pipeline for sentiment analysis processing 100K reviews/day at {company}.",
            "Created recommendation engine boosting user engagement by 35% at {company}.",
            "Performed A/B testing and statistical analysis for product decisions at {company}.",
            "Built fraud detection system saving $2M annually using ML models at {company}.",
        ],
        "education": ["M.Sc in Data Science", "B.Tech in Computer Science", "M.Tech in AI/ML", "B.Sc in Statistics"],
        "titles": ["Data Scientist", "ML Engineer", "AI Researcher", "Data Analyst", "Research Scientist"],
    },
    "DevOps Engineer": {
        "skills": [
            ["Docker", "Kubernetes", "AWS", "CI/CD", "Jenkins", "Terraform", "Linux"],
            ["Azure", "Docker", "Ansible", "Terraform", "Kubernetes", "GitLab CI", "Bash"],
            ["GCP", "Kubernetes", "Helm", "Istio", "Prometheus", "Grafana", "ArgoCD"],
            ["AWS", "CloudFormation", "Lambda", "ECS", "ECR", "CodePipeline", "Linux"],
            ["Docker", "Jenkins", "Kubernetes", "Nginx", "Linux", "Shell scripting", "Git"],
        ],
        "experience_templates": [
            "Set up CI/CD pipelines reducing deployment time from 2 hours to 15 minutes at {company}.",
            "Managed Kubernetes clusters hosting 50+ microservices at {company}.",
            "Implemented infrastructure-as-code using Terraform for AWS resources at {company}.",
            "Reduced cloud costs by 40% through resource optimization at {company}.",
            "Built monitoring and alerting systems using Prometheus and Grafana at {company}.",
        ],
        "education": ["B.Tech in Computer Science", "B.E. in Information Technology", "B.Sc in Networking"],
        "titles": ["DevOps Engineer", "SRE", "Cloud Engineer", "Infrastructure Engineer", "Platform Engineer"],
    },
    "Full Stack Developer": {
        "skills": [
            ["React", "Node.js", "MongoDB", "Express", "JavaScript", "REST API", "Docker"],
            ["Vue.js", "Python", "Django", "PostgreSQL", "HTML", "CSS", "AWS"],
            ["Angular", "Java", "Spring Boot", "MySQL", "TypeScript", "Docker", "Git"],
            ["React", "Python", "FastAPI", "PostgreSQL", "TypeScript", "Redis", "AWS"],
            ["Next.js", "Node.js", "GraphQL", "MongoDB", "TypeScript", "Vercel", "Prisma"],
        ],
        "experience_templates": [
            "Built end-to-end e-commerce platform serving 10K daily users at {company}.",
            "Developed full-stack SaaS application with React and Node.js at {company}.",
            "Created admin dashboard and REST API for inventory management at {company}.",
            "Integrated third-party payment APIs (Stripe, Razorpay) at {company}.",
            "Led team of 4 developers building customer portal from scratch at {company}.",
        ],
        "education": ["B.Tech in Computer Science", "B.E. in CSE", "M.Tech in Software Engineering"],
        "titles": ["Full Stack Developer", "MERN Stack Developer", "Software Engineer", "Web Application Developer"],
    },
    "Mobile Developer": {
        "skills": [
            ["React Native", "JavaScript", "Redux", "REST API", "iOS", "Android", "Expo"],
            ["Flutter", "Dart", "Firebase", "REST API", "Android", "iOS", "BLoC"],
            ["Android", "Kotlin", "Java", "Jetpack Compose", "Room DB", "Retrofit"],
            ["iOS", "Swift", "SwiftUI", "CoreData", "Combine", "XCTest", "Xcode"],
            ["React Native", "TypeScript", "GraphQL", "Firebase", "Push Notifications"],
        ],
        "experience_templates": [
            "Developed cross-platform mobile app with 50K+ downloads using React Native at {company}.",
            "Built Flutter app with offline-first architecture for rural users at {company}.",
            "Published Android app achieving 4.5 star rating on Google Play at {company}.",
            "Integrated payment gateway and push notifications in iOS app at {company}.",
            "Optimized app performance reducing load time by 50% at {company}.",
        ],
        "education": ["B.Tech in Computer Science", "B.E. in IT", "B.Sc in Computer Science"],
        "titles": ["Mobile Developer", "React Native Developer", "Flutter Developer", "Android Developer", "iOS Developer"],
    },
    "Data Engineer": {
        "skills": [
            ["Apache Spark", "Python", "Hadoop", "SQL", "AWS S3", "Airflow", "Kafka"],
            ["Python", "dbt", "Snowflake", "Airflow", "SQL", "AWS Glue", "Redshift"],
            ["Scala", "Spark", "Kafka", "Flink", "Cassandra", "HDFS", "Hive"],
            ["Python", "BigQuery", "dbt", "Airflow", "Dataflow", "GCP", "SQL"],
            ["Python", "Databricks", "Delta Lake", "Spark", "Azure Data Factory", "SQL"],
        ],
        "experience_templates": [
            "Built ETL pipelines processing 10TB of data daily using Apache Spark at {company}.",
            "Designed data warehouse on Snowflake reducing query time by 70% at {company}.",
            "Created real-time streaming pipeline using Kafka and Flink at {company}.",
            "Migrated on-premise data warehouse to AWS Redshift at {company}.",
            "Built data lake architecture on GCP for 500M+ records at {company}.",
        ],
        "education": ["B.Tech in Computer Science", "M.Tech in Data Engineering", "B.E. in CSE"],
        "titles": ["Data Engineer", "Big Data Engineer", "ETL Developer", "Analytics Engineer", "Data Platform Engineer"],
    },
    "Cybersecurity Analyst": {
        "skills": [
            ["Penetration Testing", "Kali Linux", "Metasploit", "Burp Suite", "OWASP", "Python", "Nmap"],
            ["SIEM", "Splunk", "Incident Response", "Threat Intelligence", "Python", "Wireshark"],
            ["Network Security", "Firewall", "IDS/IPS", "VPN", "PKI", "Linux", "Cisco"],
            ["Cloud Security", "AWS Security", "IAM", "GuardDuty", "Security Hub", "Python"],
            ["SOC", "MITRE ATT&CK", "Threat Hunting", "Forensics", "YARA", "Python", "Splunk"],
        ],
        "experience_templates": [
            "Conducted penetration testing identifying 30+ vulnerabilities for clients at {company}.",
            "Monitored SIEM alerts and responded to 200+ security incidents at {company}.",
            "Implemented zero-trust network architecture reducing breach risk at {company}.",
            "Led red team exercises for Fortune 500 companies at {company}.",
            "Developed security automation scripts reducing triage time by 60% at {company}.",
        ],
        "education": ["B.Tech in Cybersecurity", "B.E. in Computer Science", "B.Sc in Information Security"],
        "titles": ["Security Analyst", "Penetration Tester", "SOC Analyst", "Information Security Engineer", "Ethical Hacker"],
    },
}

COMPANIES = [
    "Infosys", "TCS", "Wipro", "HCL Technologies", "Tech Mahindra",
    "Accenture", "Capgemini", "Cognizant", "Mphasis", "Hexaware",
    "Zoho", "Freshworks", "Razorpay", "PhonePe", "CRED",
    "Flipkart", "Amazon India", "Microsoft India", "IBM India", "Oracle India",
    "Deloitte", "EY", "KPMG", "PwC", "Mindtree",
    "Persistent Systems", "L&T Infotech", "Minda Industries", "NIIT Technologies",
]

FIRST_NAMES = [
    "Aarav", "Priya", "Rohit", "Sneha", "Karthik", "Meera", "Arjun", "Divya",
    "Vikram", "Ananya", "Suresh", "Pooja", "Rahul", "Nisha", "Aditya", "Kavya",
    "Siddharth", "Shreya", "Rajesh", "Asha", "Nikhil", "Suman", "Deepak", "Riya",
    "Harish", "Lakshmi", "Venkat", "Anjali", "Praveen", "Swathi", "Gopal", "Yamini",
    "Bhaskar", "Revathi", "Mohan", "Saranya", "Ganesh", "Vidya", "Dinesh", "Pavithra",
    "Manish", "Kritika", "Ajay", "Bhavana", "Ravi", "Sunita", "Ashok", "Padmaja",
]

LAST_NAMES = [
    "Sharma", "Patel", "Reddy", "Nair", "Iyer", "Kumar", "Singh", "Verma",
    "Gupta", "Mehta", "Joshi", "Pillai", "Menon", "Rao", "Naik", "Deshpande",
    "Patil", "Bhat", "Murthy", "Shetty", "Krishnan", "Subramaniam", "Venkatesh",
    "Agarwal", "Mishra", "Chandra", "Bose", "Das", "Roy", "Sen",
]

UNIVERSITIES = [
    "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
    "NIT Trichy", "NIT Surathkal", "NIT Warangal", "BITS Pilani", "VIT Vellore",
    "SRM University", "Manipal Institute of Technology", "Anna University",
    "Pune University", "Mumbai University", "Bangalore University", "Osmania University",
    "Amrita University", "PSG College of Technology", "RV College of Engineering",
]

YEARS = list(range(2015, 2024))


def random_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def random_email(name):
    parts = name.lower().split()
    domain = random.choice(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"])
    return f"{parts[0]}.{parts[1]}{random.randint(10,99)}@{domain}"


def random_phone():
    return f"+91 {random.randint(6,9)}{random.randint(100000000,999999999)}"


def random_experience_years():
    return random.randint(1, 10)


def generate_resume_text(role, role_data):
    name = random_name()
    email = random_email(name)
    phone = random_phone()
    title = random.choice(role_data["titles"])
    edu = random.choice(role_data["education"])
    uni = random.choice(UNIVERSITIES)
    grad_year = random.choice(YEARS)
    exp_years = random_experience_years()
    skills = random.choice(role_data["skills"])
    # Add 2-3 extra random skills sometimes
    extras = random.sample(["Git", "Agile", "Scrum", "JIRA", "Confluence", "Linux", "VS Code", "Postman"], k=random.randint(0, 3))
    all_skills = list(set(skills + extras))
    random.shuffle(all_skills)

    # Build experience section
    num_jobs = random.randint(1, 3)
    exp_entries = []
    companies_used = random.sample(COMPANIES, k=num_jobs)
    for i, company in enumerate(companies_used):
        template = random.choice(role_data["experience_templates"])
        bullet = template.format(company=company)
        years_at = random.randint(1, 3)
        end_year = 2024 - i
        start_year = end_year - years_at
        exp_entries.append(
            f"{title} | {company} | {start_year} - {end_year}\n"
            f"• {bullet}\n"
            f"• Collaborated with cross-functional teams to deliver projects on time.\n"
            f"• Participated in code reviews and mentored junior developers."
        )

    # Build resume text
    resume = f"""{name}
{title}
{email} | {phone} | LinkedIn: linkedin.com/in/{name.lower().replace(' ', '-')}

SUMMARY
Results-driven {title} with {exp_years}+ years of experience in building scalable applications.
Passionate about clean code, performance optimization, and delivering business value.

SKILLS
{', '.join(all_skills)}

EXPERIENCE
{'─' * 50}
{chr(10).join(exp_entries)}

EDUCATION
{'─' * 50}
{edu} | {uni} | {grad_year}
CGPA: {round(random.uniform(7.0, 9.8), 1)}/10

CERTIFICATIONS
• {random.choice(['AWS Certified Solutions Architect', 'Google Cloud Professional', 'Microsoft Azure Fundamentals', 'Certified Kubernetes Administrator', 'Oracle Java Certified', 'Scrum Master Certified', 'CompTIA Security+', 'Cisco CCNA', 'TensorFlow Developer Certificate'])}
"""
    return resume.strip(), name, email, phone


def generate_dataset(output_path, samples_per_role=30):
    rows = []
    for role, role_data in ROLES.items():
        print(f"Generating {samples_per_role} resumes for: {role}")
        for _ in range(samples_per_role):
            text, name, email, phone = generate_resume_text(role, role_data)
            rows.append({
                "resume_text": text,
                "label": role,
                "candidate_name": name,
                "email": email,
                "phone": phone,
            })

    # Shuffle
    random.shuffle(rows)

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["resume_text", "label", "candidate_name", "email", "phone"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n✅ Dataset generated: {output_path}")
    print(f"   Total resumes: {len(rows)}")
    print(f"   Roles: {list(ROLES.keys())}")


if __name__ == "__main__":
    generate_dataset("../data/resumes_dataset.csv", samples_per_role=30)
