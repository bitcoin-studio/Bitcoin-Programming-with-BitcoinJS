FROM openfaas/of-watchdog:0.7.7 AS watchdog
FROM alpine:3.10 AS runtime

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

# Add non root user
RUN addgroup -S app && adduser app -S -G app
RUN chown app /home/app

WORKDIR /home/app/

USER app

# Don't forget to build locally first
# Don't forget manual steps to generate search-index.js (https://github.com/Mogztter/antora-lunr)
COPY ./dist /home/app/dist

ENV mode="static"
ENV static_path="/home/app/dist"

ENV exec_timeout="10s"
ENV write_timeout="11s"
ENV read_timeout="11s"

HEALTHCHECK --interval=5s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]