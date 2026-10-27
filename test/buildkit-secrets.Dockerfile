FROM alpine

ARG SECRET_SHA256
RUN --mount=type=secret,id=buildsecret,required=true \
    --mount=type=secret,id=optional \
    test "$(sha256sum /run/secrets/buildsecret | cut -d ' ' -f 1)" = "$SECRET_SHA256" && \
    test ! -e /run/secrets/optional

RUN test ! -e /run/secrets/buildsecret
