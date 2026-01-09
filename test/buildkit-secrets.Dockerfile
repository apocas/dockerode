FROM alpine

RUN --mount=type=secret,id=s,target=/secret tail /secret

CMD ["bash"]
