# syntax=docker/dockerfile:1

FROM golang:1.23 AS build

WORKDIR /src

COPY main.go ./main.go

RUN go build -o /bin/hello ./main.go

FROM scratch

COPY --from=build /bin/hello /bin/hello

CMD ["/bin/hello"]