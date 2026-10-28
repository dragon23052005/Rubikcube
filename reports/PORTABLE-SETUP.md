# Portable IntelliJ setup verification

- Shared IntelliJ Application configurations use project-relative working directories and Java 21 project SDK; no absolute machine paths are stored in them.
- Quick Start explicitly activates `standalone`, with a persistent H2 database under ignored `var/`. MySQL remains the default for normal main-class runs and the MySQL configuration.
- Maven Wrapper, prebuilt CSS/JavaScript, local image assets and simulator bundles are included. Node/Python are not required for running the application.
- A clean `mvn -o clean verify` passed all 55 Java tests and produced the executable JAR. JavaScript syntax checks, 11 simulator tests and 8 timer tests passed.
- Started the packaged JAR from a new empty working directory with `--spring.profiles.active=standalone --server.port=8081`, without local database configuration. The EP detail page and local simulator bundle returned HTTP 200. API checks confirmed automatic import of 606 cases, including 54 EP cases. H2 created its persistent database in that directory's `var/`.
- Private MySQL configuration, demo account passwords, local databases, logs, build output and dependency folders are excluded from Git.
- First-time builds need Internet access for Maven dependencies. Email registration works locally; Google/Facebook require each installation's provider credentials. Different database modes do not automatically share user data.

IntelliJ itself was not launched during this check; the same main class and profile were verified using the packaged application on Windows with JDK 21.
