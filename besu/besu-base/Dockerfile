FROM adoptopenjdk/openjdk11:alpine-slim AS builder
RUN apk add --no-cache git tar
RUN git clone -b v21.1.1/ibft-reject-empty-blocks https://github.com/irzinfante/besu
WORKDIR /besu
RUN ./gradlew build -x test
RUN tar -xf ./build/distributions/besu-21.1.1.tar.gz

FROM adoptopenjdk/openjdk11:alpine-jre
COPY --from=builder /besu/besu-21.1.1/bin/ /bin
COPY --from=builder /besu/besu-21.1.1/lib/ /lib