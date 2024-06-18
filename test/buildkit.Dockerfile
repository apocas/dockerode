FROM alpine

RUN --mount=type=cache,target=/test echo test

CMD ["bash"]
